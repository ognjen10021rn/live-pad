package rs.ogisa.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import rs.ogisa.models.PollVote;

import java.util.List;
import java.util.Optional;

@Repository
public interface PollVoteRepository extends JpaRepository<PollVote, Long> {

    // Find vote by option and user
    Optional<PollVote> findByPollOptionIdAndUserId(Long pollOptionId, Long userId);

    // Find all votes by a user for a specific poll
    @Query("SELECT pv FROM PollVote pv WHERE pv.pollOption.poll.id = :pollId AND pv.userId = :userId")
    List<PollVote> findByPollIdAndUserId(@Param("pollId") Long pollId, @Param("userId") Long userId);

    // Check if user has voted on a poll
    @Query("SELECT COUNT(pv) > 0 FROM PollVote pv WHERE pv.pollOption.poll.id = :pollId AND pv.userId = :userId")
    boolean hasUserVotedOnPoll(@Param("pollId") Long pollId, @Param("userId") Long userId);

    // Count votes for an option
    Long countByPollOptionId(Long pollOptionId);

    // Delete all votes for a specific poll option
    void deleteByPollOptionId(Long pollOptionId);

    // Delete user's votes on a poll
    @Modifying
    @Query("DELETE FROM PollVote pv WHERE pv.pollOption.poll.id = :pollId AND pv.userId = :userId")
    void deleteByPollIdAndUserId(@Param("pollId") Long pollId, @Param("userId") Long userId);
}
