package rs.ogisa.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PollOptionResponse {
    private Long id;
    private String text;
    private Integer votes;
    private List<Long> votedBy;
    private Integer optionOrder;
}