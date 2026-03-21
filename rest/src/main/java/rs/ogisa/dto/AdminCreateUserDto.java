package rs.ogisa.dto;

import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class AdminCreateUserDto implements Serializable {

    private String username;

    @Email
    private String email;

    private String password;

    /**
     * Role as a string, e.g. "ROLE_USER" or "ROLE_ADMINISTRATOR".
     * Defaults to ROLE_USER if blank or unrecognized.
     */
    private String role;
}
