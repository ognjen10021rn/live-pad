package rs.ogisa.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "poll_options")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PollOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poll_id", nullable = false)
    @JsonIgnore
    private Poll poll;

    @Column(nullable = false, length = 200)
    private String text;

    @Column(nullable = false)
    @Builder.Default
    private Integer votes = 0;

    @OneToMany(mappedBy = "pollOption", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PollVote> pollVotes = new ArrayList<>();

    @Version
    private Integer version;

    @Column(name = "option_order")
    private Integer optionOrder;

    // Helper method to increment votes
    public void incrementVotes() {
        this.votes++;
    }

    // Helper method to decrement votes
    public void decrementVotes() {
        if (this.votes > 0) {
            this.votes--;
        }
    }

    // Check if user has voted for this option
    public boolean hasUserVoted(Long userId) {
        return pollVotes.stream()
                .anyMatch(vote -> vote.getUserId().equals(userId));
    }

    // Get list of user IDs who voted
    public List<Long> getVotedByUserIds() {
        return pollVotes.stream()
                .map(PollVote::getUserId)
                .toList();
    }
}
