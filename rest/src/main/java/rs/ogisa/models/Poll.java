package rs.ogisa.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "polls")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Poll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long noteId;

    @Column(nullable = false, length = 500)
    private String question;

    @Column(nullable = false)
    private Long createdBy;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime expiresAt;

    @Column(nullable = false)
    @Builder.Default
    private Boolean allowMultipleVotes = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false)
    @Builder.Default
    private Integer totalVotes = 0;

    @OneToMany(mappedBy = "poll", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PollOption> options = new ArrayList<>();

    @Version
    private Integer version;


    // Helper method to add an option
    public void addOption(PollOption option) {
        options.add(option);
        option.setPoll(this);
    }

    // Helper method to remove an option
    public void removeOption(PollOption option) {
        options.remove(option);
        option.setPoll(null);
    }

    // Check if poll is expired
    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }

    // Increment total votes
    public void incrementTotalVotes() {
        this.totalVotes++;
        System.out.println("TotalVotes: " + totalVotes);
    }

    // Decrement total votes
    public void decrementTotalVotes() {
        if (this.totalVotes > 0) {
            this.totalVotes--;
        }
    }
}
