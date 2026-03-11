package rs.ogisa.services;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.parameters.P;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import rs.ogisa.dto.*;
import rs.ogisa.exceptions.BadRequestException;
import rs.ogisa.exceptions.ResourceNotFoundException;
import rs.ogisa.models.*;
import rs.ogisa.repositories.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class PollService {

    private final PollRepository pollRepository;
    private final PollOptionRepository pollOptionRepository;
    private final PollVoteRepository pollVoteRepository;

    @Transactional
    public PollResponse createPoll(CreatePollRequest request) {
        log.info("Creating poll for note ID: {}", request.getNoteId());
        if (request.getOptions() == null || request.getOptions().size() < 2) {
            throw new BadRequestException("Poll must have at least 2 options");
        }
        if (request.getOptions().size() > 10) {
            throw new BadRequestException("Poll cannot have more than 10 options");
        }
        long emptyOptions = request.getOptions().stream()
                .filter(opt -> opt == null || opt.trim().isEmpty())
                .count();
        if (emptyOptions > 0) {
            throw new BadRequestException("Poll options cannot be empty");
        }

        Poll poll = Poll.builder()
                .noteId(request.getNoteId())
                .question(request.getQuestion())
//                .options()
                .createdBy(request.getCreatedBy())
                .expiresAt(request.getExpiresAt())
                .allowMultipleVotes(request.getAllowMultipleVotes())
                .isActive(true)
                .totalVotes(0)
                .build();

        IntStream.range(0, request.getOptions().size())
                .forEach(i -> {
                    PollOption option = PollOption.builder()
                            .text(request.getOptions().get(i).trim())
                            .votes(0)
                            .optionOrder(i)
                            .build();
                    poll.addOption(option);
                });

        Poll savedPoll = pollRepository.save(poll);
        log.info("Poll created successfully with ID: {}", savedPoll.getId());
        return mapToResponse(savedPoll);
    }
    @Transactional
    public List<PollResponse> getPollsByNoteId(Long noteId) {
        log.info("Fetching polls for note ID: {}", noteId);
        List<Poll> polls = pollRepository.findByNoteIdOrderByCreatedAtDesc(noteId);
        return polls.stream().map(this::mapToResponse).toList();
    }
    @Transactional(readOnly = true)
    public List<PollResponse> getActivePolls(Long noteId) {
        log.info("Fetching active polls for note ID: {}", noteId);
        List<Poll> polls = pollRepository.findActiveByNoteId(noteId);
        return polls.stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public PollResponse getPollById(Long pollId) {
        log.info("Fetching poll with ID: {}", pollId);
        Poll poll = pollRepository.findByIdWithOptions(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found with ID: " + pollId));
        return mapToResponse(poll);
    }
    @Transactional
    public PollResponse vote(Long pollId, VoteRequest request) {
        log.info("Processing vote for poll ID: {} by user ID: {}", pollId, request.getUserId());

        Poll poll = pollRepository.findByIdWithOptions(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found with ID: " + pollId));
        if (!poll.getIsActive()) {
            throw new BadRequestException("Poll is not active");
        }
        if (poll.isExpired()) {
            throw new BadRequestException("Poll has expired");
        }
        PollOption option = pollOptionRepository.findById(request.getOptionId())
                .orElseThrow(() -> new ResourceNotFoundException("Poll option not found with ID: " + request.getOptionId()));
        if (!option.getPoll().getId().equals(pollId)) {
            throw new BadRequestException("Option does not belong to this poll");
        }
        boolean hasVoted = pollVoteRepository.hasUserVotedOnPoll(pollId, request.getUserId());
        if (hasVoted && !poll.getAllowMultipleVotes()) {
            throw new BadRequestException("User has already voted on this poll. Multiple votes are not allowed.");
        }
        boolean hasVotedForOption = pollVoteRepository.findByPollOptionIdAndUserId(
                request.getOptionId(), request.getUserId()).isPresent();
        if (hasVotedForOption) {
            throw new BadRequestException("User has already voted for this option");
        }
        PollVote vote = PollVote.builder()
                .pollOption(option)
                .userId(request.getUserId())
                .build();

        pollVoteRepository.save(vote);

        pollOptionRepository.incrementVotes(option.getId());
        pollRepository.incrementTotalVotes(pollId);


//        pollOptionRepository.save(option);
//        pollRepository.save(poll);

        log.info("Vote recorded successfully for poll ID: {}", pollId);

        Poll updatedPoll = pollRepository.findByIdWithOptions(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found"));

        return mapToResponse(updatedPoll);
    }
    @Transactional
    public PollResponse removeVote(Long pollId, Long optionId, Long userId) {
        log.info("Removing vote for poll ID: {}, option ID: {}, user ID: {}", pollId, optionId, userId);

        Poll poll = pollRepository.findByIdWithOptions(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found with ID: " + pollId));

        if (!poll.getIsActive()) {
            throw new BadRequestException("Cannot remove vote from inactive poll");
        }

        PollOption option = pollOptionRepository.findById(optionId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll option not found with ID: " + optionId));

        if (!option.getPoll().getId().equals(pollId)) {
            throw new BadRequestException("Option does not belong to this poll");
        }

        PollVote vote = pollVoteRepository.findByPollOptionIdAndUserId(optionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vote not found for this user and option"));

        pollVoteRepository.delete(vote);

        option.decrementVotes();
        poll.decrementTotalVotes();

        pollOptionRepository.save(option);
        pollRepository.save(poll);
        log.info("Vote removed successfully");
        Poll updatedPoll = pollRepository.findByIdWithOptions(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found"));
        return mapToResponse(updatedPoll);
    }
    @Transactional
    public PollResponse updatePoll(Long pollId, UpdatePollRequest request, Long userId) {
        log.info("Updating poll ID: {} by user ID: {}", pollId, userId);

        Poll poll = pollRepository.findByIdWithOptions(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found with ID: " + pollId));

        if (!poll.getCreatedBy().equals(userId)) {
            throw new BadRequestException("Only poll creator can update the poll");
        }

        if (request.getIsActive() != null) {
            poll.setIsActive(request.getIsActive());
            log.info("Poll {} status changed to: {}", pollId, request.getIsActive());
        }
        if (request.getExpiresAt() != null) {
            poll.setExpiresAt(request.getExpiresAt());
            log.info("Poll {} expiration updated to: {}", pollId, request.getExpiresAt());
        }
        Poll updatedPoll = pollRepository.save(poll);
        log.info("Poll updated successfully");
        return mapToResponse(updatedPoll);
    }
    @Transactional
    public void deletePoll(Long pollId, Long userId) {
        log.info("Deleting poll ID: {} by user ID: {}", pollId, userId);
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found with ID: " + pollId));

        if (!poll.getCreatedBy().equals(userId)) {
            throw new BadRequestException("Only poll creator can delete the poll");
        }
        pollRepository.delete(poll);
        log.info("Poll deleted successfully");
    }
    @Transactional(readOnly = true)
    public List<PollResponse> getPollsByCreator(Long userId) {
        log.info("Fetching polls created by user ID: {}", userId);
        List<Poll> polls = pollRepository.findByCreatedByOrderByCreatedAtDesc(userId);
        return polls.stream().map(this::mapToResponse).toList();
    }
    @Transactional
    public void deletePollsByNoteId(Long noteId) {
        log.info("Deleting all polls for note ID: {}", noteId);
        pollRepository.deleteByNoteId(noteId);
        log.info("All polls deleted for note ID: {}", noteId);
    }

    @Transactional(readOnly = true)
    public Long countActivePolls(Long noteId) {
        return pollRepository.countActiveByNoteId(noteId);
    }

    /**
     * Close expired polls (scheduled task)
     */
    @Transactional
    public void closeExpiredPolls() {
        log.info("Checking for expired polls to close");
        List<Poll> expiredPolls = pollRepository.findExpiredActivePolls(LocalDateTime.now());

        for (Poll poll : expiredPolls) {
            poll.setIsActive(false);
            pollRepository.save(poll);
            log.info("Closed expired poll ID: {}", poll.getId());
        }

        log.info("Closed {} expired polls", expiredPolls.size());
    }

    /**
     * Get poll statistics
     */
//    @Transactional(readOnly = true)
//    public PollStatsResponse getPollStats(Long pollId) {
//        log.info("Fetching statistics for poll ID: {}", pollId);
//
//        Poll poll = pollRepository.findByIdWithOptions(pollId)
//                .orElseThrow(() -> new ResourceNotFoundException("Poll not found with ID: " + pollId));
//
//        PollOption topOption = poll.getOptions().stream()
//                .max((o1, o2) -> Integer.compare(o1.getVotes(), o2.getVotes()))
//                .orElse(null);
//
//        return PollStatsResponse.builder()
//                .pollId(poll.getId())
//                .totalVotes(poll.getTotalVotes())
//                .totalOptions(poll.getOptions().size())
//                .topOption(topOption != null ? topOption.getText() : null)
//                .topOptionVotes(topOption != null ? topOption.getVotes() : 0)
//                .isActive(poll.getIsActive())
//                .isExpired(poll.isExpired())
//                .participationCount(poll.getOptions().stream()
//                        .mapToInt(opt -> opt.getPollVotes().size())
//                        .sum())
//                .build();
//    }

    /**
     * Get user's voting history for a poll
     */
    @Transactional(readOnly = true)
    public List<Long> getUserVotes(Long pollId, Long userId) {
        log.info("Fetching user votes for poll ID: {} and user ID: {}", pollId, userId);

        List<PollVote> votes = pollVoteRepository.findByPollIdAndUserId(pollId, userId);

        return votes.stream()
                .map(vote -> vote.getPollOption().getId())
                .toList();
    }

    /**
     * Check if user can vote on a poll
     */
    @Transactional(readOnly = true)
    public boolean canUserVote(Long pollId, Long userId) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found with ID: " + pollId));

        if (!poll.getIsActive() || poll.isExpired()) {
            return false;
        }

        boolean hasVoted = pollVoteRepository.hasUserVotedOnPoll(pollId, userId);

        return !hasVoted || poll.getAllowMultipleVotes();
    }


    private PollResponse mapToResponse(Poll poll) {
        List<PollOptionResponse> optionResponses = poll.getOptions().stream()
                .sorted((o1, o2) -> Integer.compare(o1.getOptionOrder(), o2.getOptionOrder()))
                .map(option -> PollOptionResponse.builder()
                        .id(option.getId())
                        .text(option.getText())
                        .votes(option.getVotes())
                        .votedBy(option.getVotedByUserIds())
                        .optionOrder(option.getOptionOrder())
                        .build())
                .toList();

        return PollResponse.builder()
                .id(poll.getId())
                .noteId(poll.getNoteId())
                .question(poll.getQuestion())
                .createdBy(poll.getCreatedBy())
                .createdAt(poll.getCreatedAt())
                .expiresAt(poll.getExpiresAt())
                .allowMultipleVotes(poll.getAllowMultipleVotes())
                .isActive(poll.getIsActive())
                .totalVotes(poll.getTotalVotes())
                .options(optionResponses)
                .isExpired(poll.isExpired())
                .build();
    }


}
