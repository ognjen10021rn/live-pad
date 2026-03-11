package rs.ogisa;

import lombok.AllArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import rs.ogisa.models.User;
import rs.ogisa.repositories.UserRepository;

@Component
@AllArgsConstructor
public class BootstrapData implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        if(userRepository.findAll().isEmpty()){
            User user = new User();
            user.setUsername("ogisa");
            user.setEmail("ogisa@ogisa.com");
            user.setPassword(passwordEncoder.encode("1234"));

            userRepository.save(user);
        }
    }
}
