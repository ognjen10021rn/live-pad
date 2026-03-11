package rs.ogisa.dto;

import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class CreateUserDto implements Serializable{

    private String username;

    @Email
    private String email;

    private String password;

}
