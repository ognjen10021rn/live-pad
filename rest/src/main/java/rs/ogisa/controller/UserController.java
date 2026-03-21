package rs.ogisa.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import rs.ogisa.dto.CreateUserDto;
import rs.ogisa.dto.LoginRequestDto;
import rs.ogisa.dto.ManageUserDto;
import rs.ogisa.dto.AdminCreateUserDto;
import rs.ogisa.jwt.JwtUtil;
import rs.ogisa.models.LoginResponse;
import rs.ogisa.models.User;
import rs.ogisa.services.UserService;

import java.util.List;

@RestController
@CrossOrigin
@AllArgsConstructor
@RequestMapping("/api/v1/user")
public class UserController {

    private UserService userService;
    private AuthenticationManager authenticationManager;
    private JwtUtil jwtUtil;

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDto loginRequest) {
        try {
            authenticationManager
                    .authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getUsernameOrEmail(),
                            loginRequest.getPassword()));
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(new LoginResponse(jwtUtil.generateToken(
                userService.getUserByUsernameOrEmail(loginRequest.getUsernameOrEmail()))));
    }

    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@RequestBody CreateUserDto registerRequest) {
        userService.createUser(registerRequest);
        return ResponseEntity.ok(new LoginResponse(
                jwtUtil.generateToken(userService.getUserByUsernameOrEmail(registerRequest.getUsername()))));
    }

    // TODO GITHUB REGISTER
    @GetMapping("/auth/githubRegister")
    public ResponseEntity<?> githubRegister() {
        // login/oauth2/code/github
        // http://localhost:8080/oauth2/authorization/github
        System.out.println("USAOOOOO");

        return null;
    }

    @PostMapping("/createUser")
    public ResponseEntity<Void> createUser(@RequestBody CreateUserDto user) {

        if (!userService.createUser(user)) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok().build();
    }

    @GetMapping("/getAllUsers")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/getAllUsersWithoutId/{id}")
    public List<User> getAllUsers(@PathVariable Long id) {
        return userService.getAllUsersWithoutId(id);
    }

    @GetMapping("/getAllUsersFromNoteUsingNoteId/{noteId}/{userId}")
    public List<User> getAllUsersFromNote(@PathVariable Long noteId, @PathVariable Long userId) {
        return userService.getAllUsersFromNoteUsingNoteId(noteId, userId);
    }

    @GetMapping("/getAllUsersThatAreNotInNoteId/{noteId}")
    public List<User> getAllUsersThatAreNotInNoteId(@PathVariable Long noteId) {
        return userService.getAllUsersThatAreNotInNoteId(noteId);
    }

    @PostMapping("/removeUserFromNote/{noteId}")
    public ResponseEntity<?> removeUserFromNote(@PathVariable Long noteId, @RequestBody ManageUserDto manageUserDto) {
        return userService.removeUserFromNote(noteId, manageUserDto);
    }

    @PostMapping("/addUserToNote/{noteId}")
    public ResponseEntity<?> addUserToNote(@PathVariable Long noteId, @RequestBody ManageUserDto manageUserDto) {
        return userService.addUserToNote(noteId, manageUserDto);
    }

    // ── Admin endpoints ───────────────────────────────────────────────────────

    @GetMapping("/admin/getAllUsers")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATOR')")
    public List<User> adminGetAllUsers() {
        return userService.getAllUsers();
    }

    @PostMapping("/admin/create")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATOR')")
    public ResponseEntity<?> adminCreateUser(@RequestBody AdminCreateUserDto dto) {
        if (!userService.createUserWithRole(dto)) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/admin/delete/{userId}")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATOR')")
    public ResponseEntity<Void> adminDeleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }

}
