package rs.ogisa.configuration;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import rs.ogisa.dto.CreateUserDto;
import rs.ogisa.dto.UserDto;
import rs.ogisa.jwt.JwtUtil;
import rs.ogisa.services.UserService;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Component
public class AuthenticationSuccessHandlerController implements AuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserService userService;

    public AuthenticationSuccessHandlerController(JwtUtil jwtUtil, UserService userService) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        Map<String, Object> attributes = oauthToken.getPrincipal().getAttributes();

        String email = (String) attributes.get("email");
        String username = (String) attributes.get("login");

        System.out.println(email + " " + username + "\n\n\n\n\n");
        var user = userService.getUserByUsernameOrEmail(username);
        System.out.println(user + " - Is user Null?!\n");
        if (user == null) {
            CreateUserDto dto = new CreateUserDto();
            dto.setUsername(username);
            dto.setEmail(email);
            dto.setPassword(UUID.randomUUID().toString());
            System.out.println(dto + " - This is the dto\n");
            userService.createUser(dto);
        }

        String token = jwtUtil.generateToken(userService.getUserByUsernameOrEmail(username));

        String redirectUrl = "exp://192.168.1.3:8081/--/login?token=" + token;

        System.out.println("=== OAuth Success Handler ===");
        System.out.println("Generated token: " + token);
        System.out.println("Redirecting to: " + redirectUrl);

        response.sendRedirect(redirectUrl);
//        response.setContentType("text/html");
//        response.getWriter().println(
//                "<!DOCTYPE html>" +
//                        "<html>" +
//                        "<head>" +
//                        "  <meta http-equiv='refresh' content='0;url=" + redirectUrl + "'>" +
//                        "</head>" +
//                        "<body>" +
//                        "  <p>Redirecting to app...</p>" +
//                        "  <p>If you are not redirected, <a href='" + redirectUrl + "'>click here</a>.</p>" +
//                        "</body>" +
//                        "</html>"
//        );


    }
}
