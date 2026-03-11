package rs.ogisa.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import rs.ogisa.models.Poll;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PollResponse {
    private Long id;
    private Long noteId;
    private String question;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private Boolean allowMultipleVotes;
    private Boolean isActive;
    private Integer totalVotes;
    private List<PollOptionResponse> options;
    private Boolean isExpired;

}
