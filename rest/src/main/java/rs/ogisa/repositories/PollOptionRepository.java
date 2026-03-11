package rs.ogisa.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import rs.ogisa.models.PollOption;

import java.util.List;
import java.util.Optional;

@Repository
public interface PollOptionRepository extends JpaRepository<PollOption, Long> {

    // Find all options for a poll
    List<PollOption> findByPollIdOrderByOptionOrderAsc(Long pollId);

    // Find option with votes eagerly loaded
    @Query("SELECT po FROM PollOption po LEFT JOIN FETCH po.pollVotes WHERE po.id = :optionId")
    Optional<PollOption> findByIdWithVotes(@Param("optionId") Long optionId);

    // Find option and verify it belongs to a specific poll
    Optional<PollOption> findByIdAndPollId(Long optionId, Long pollId);

    @Modifying
    @Query("UPDATE PollOption p SET p.votes = p.votes + 1 WHERE p.id = :id")
    void incrementVotes(@Param("id") Long id);
}
