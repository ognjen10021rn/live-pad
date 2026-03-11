package rs.ogisa.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import rs.ogisa.models.Poll;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PollRepository extends JpaRepository<Poll, Long> {

    // Find all polls for a specific note
    List<Poll> findByNoteIdOrderByCreatedAtDesc(Long noteId);

    // Find all active polls for a note
    @Query("SELECT p FROM Poll p WHERE p.noteId = :noteId AND p.isActive = true ORDER BY p.createdAt DESC")
    List<Poll> findActiveByNoteId(@Param("noteId") Long noteId);

    // Find all polls created by a user
    List<Poll> findByCreatedByOrderByCreatedAtDesc(Long userId);

    // Find expired polls that are still active
    @Query("SELECT p FROM Poll p WHERE p.expiresAt < :currentTime AND p.isActive = true")
    List<Poll> findExpiredActivePolls(@Param("currentTime") LocalDateTime currentTime);

    // Find poll with options eagerly loaded
    @Query("SELECT p FROM Poll p LEFT JOIN FETCH p.options WHERE p.id = :pollId")
    Optional<Poll> findByIdWithOptions(@Param("pollId") Long pollId);

    // Count active polls for a note
    @Query("SELECT COUNT(p) FROM Poll p WHERE p.noteId = :noteId AND p.isActive = true")
    Long countActiveByNoteId(@Param("noteId") Long noteId);

    @Modifying
    @Query("UPDATE Poll p SET p.totalVotes = p.totalVotes + 1 WHERE p.id = :id")
    void incrementTotalVotes(@Param("id") Long id);

    // Delete all polls for a note
    void deleteByNoteId(Long noteId);
}
