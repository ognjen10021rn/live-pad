package rs.ogisa.controller;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rs.ogisa.dto.*;
import rs.ogisa.services.PollService;

import java.util.List;

@RestController
@AllArgsConstructor
@Slf4j
@CrossOrigin
@RequestMapping("/api/v1/polls")
public class PollController {

    private final PollService pollService;

    /**
     * Create a new poll
     * POST /api/polls
     */
    @PostMapping
    public ResponseEntity<PollResponse> createPoll(@Valid @RequestBody CreatePollRequest request) {
        log.info("REST request to create poll for note ID: {}", request.getNoteId());
        PollResponse response = pollService.createPoll(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get all polls for a note
     * GET /api/polls?noteId={noteId}
     */
    @GetMapping
    public ResponseEntity<List<PollResponse>> getPollsByNoteId(@RequestParam Long noteId) {
        log.info("REST request to get polls for note ID: {}", noteId);
        List<PollResponse> polls = pollService.getPollsByNoteId(noteId);
        return ResponseEntity.ok(polls);
    }

    /**
     * Get a specific poll by ID
     * GET /api/polls/{pollId}
     */
    @GetMapping("/{pollId}")
    public ResponseEntity<PollResponse> getPollById(@PathVariable Long pollId) {
        log.info("REST request to get poll with ID: {}", pollId);
        PollResponse poll = pollService.getPollById(pollId);
        return ResponseEntity.ok(poll);
    }

    /**
     * Vote on a poll
     * POST /api/polls/{pollId}/vote
     */
    @PostMapping("/{pollId}/vote")
    public ResponseEntity<PollResponse> vote(
            @PathVariable Long pollId,
            @Valid @RequestBody VoteRequest request) {
        log.info("REST request to vote on poll ID: {} by user ID: {}", pollId, request.getUserId());
        PollResponse response = pollService.vote(pollId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Remove a vote from a poll
     * DELETE /api/polls/{pollId}/vote
     */
    @DeleteMapping("/{pollId}/vote")
    public ResponseEntity<PollResponse> removeVote(
            @PathVariable Long pollId,
            @RequestParam Long optionId,
            @RequestParam Long userId) {
        log.info("REST request to remove vote from poll ID: {}", pollId);
        PollResponse response = pollService.removeVote(pollId, optionId, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Update poll status
     * PATCH /api/polls/{pollId}
     */
    @PatchMapping("/{pollId}")
    public ResponseEntity<PollResponse> updatePoll(
            @PathVariable Long pollId,
            @RequestParam Long userId,
            @Valid @RequestBody UpdatePollRequest request) {
        log.info("REST request to update poll ID: {}", pollId);
        PollResponse response = pollService.updatePoll(pollId, request, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a poll
     * DELETE /api/polls/{pollId}
     */
    @DeleteMapping("/{pollId}")
    public ResponseEntity<Void> deletePoll(
            @PathVariable Long pollId,
            @RequestParam Long userId) {
        log.info("REST request to delete poll ID: {}", pollId);
        pollService.deletePoll(pollId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get polls created by a user
     * GET /api/polls/creator/{userId}
     */
    @GetMapping("/creator/{userId}")
    public ResponseEntity<List<PollResponse>> getPollsByCreator(@PathVariable Long userId) {
        log.info("REST request to get polls created by user ID: {}", userId);
        List<PollResponse> polls = pollService.getPollsByCreator(userId);
        return ResponseEntity.ok(polls);
    }
}
