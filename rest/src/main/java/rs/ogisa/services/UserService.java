package rs.ogisa.services;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import rs.ogisa.dto.CreateUserDto;
import rs.ogisa.dto.ManageUserDto;
import rs.ogisa.dto.UserDto;
import rs.ogisa.models.Role;
import rs.ogisa.models.User;
import rs.ogisa.models.UserNote;
import rs.ogisa.repositories.NoteRepository;
import rs.ogisa.repositories.UserNoteRepository;
import rs.ogisa.repositories.UserRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final NoteRepository noteRepository;
    private final UserNoteRepository userNoteRepository;
    private final PasswordEncoder passwordEncoder;


    public boolean createUser(CreateUserDto user) {

        User usr = new User();
        User usr1 = userRepository.findByUsernameOrEmail(user.getUsername(), user.getEmail());
        System.out.println(usr1 + "- USR1\n");

        if (usr1 != null) {
            return false;
        }
        usr.setEmail(user.getEmail());
        usr.setRole(Role.ROLE_USER);
        usr.setPassword(passwordEncoder.encode(user.getPassword()));
        usr.setUsername(user.getUsername());
        System.out.println(usr + " - Konacan user\n");
        userRepository.save(usr);
        return true;

    }

    public UserDto getUserByUsernameOrEmail(String username) {

        User user = userRepository.findByUsernameOrEmail(username, username);
        if (user == null) {
            return null;
        }
        UserDto userDto = new UserDto();
        userDto.setUserId(user.getUserId());
        userDto.setUsername(user.getUsername());
        userDto.setEmail(user.getEmail());
        userDto.setPassword(user.getPassword());
        userDto.setRole(user.getRole().name());
        return userDto;
    }

    public Optional<User> loadUserByUsername(String username) throws UsernameNotFoundException {

        return userRepository.findByUsername(username);
    }
    public Optional<User> loadUserByEmail(String email) throws UsernameNotFoundException {

        return userRepository.findByEmail(email);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    public List<User> getAllUsersWithoutId(Long id) {
        return userRepository.findAllUserByUserIdNot(id);
    }

    public List<User>getAllUsersFromNoteUsingNoteId(Long noteId, Long userId) {
        List<UserNote> userNotes = userNoteRepository.findAllByNoteId(noteId);

        List<User> users = new ArrayList<>();
        for (UserNote userNote : userNotes) {
            User user = userRepository.findById(userNote.getUserId()).orElseThrow(() ->
                    new UsernameNotFoundException("User with the id: " + userNote.getUserId() + " not found"));
            if(!user.getUserId().equals(userId) && !userNote.getIsDeleted()){
                users.add(user);
            }
        }

        return users;
    }
    public List<User> getAllUsersThatAreNotInNoteId(Long noteId) {
        List<User> users = userRepository.findAll();
        List<User> foundUsers = new ArrayList<>();
        for(User user : users){
            UserNote userNote1 = userNoteRepository.findByUserIdAndNoteId(user.getUserId(), noteId);
            if(userNote1 == null || userNote1.getIsDeleted()){
                foundUsers.add(user);
            }
        }
        return foundUsers;
    }

    public ResponseEntity<?> removeUserFromNote(Long noteId, ManageUserDto manageUserDto) {
        UserNote userNote = userNoteRepository.findByUserIdAndNoteId(manageUserDto.getUserId(), noteId);
        System.out.println("UserNote: " + userNote);

        if(userNote == null){
            return ResponseEntity.notFound().build();
        }

        if(!userNote.getIsUserAdmin()){
           return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        for(Long id : manageUserDto.getUserIds()){
            UserNote userNoteToDelete = userNoteRepository.findByUserIdAndNoteId(id, noteId);
            if(userNoteToDelete == null){
                return ResponseEntity.notFound().build();
            }
            if(userNoteToDelete.getIsDeleted()){
                continue;
            }

            userNoteToDelete.setIsDeleted(true);
            userNoteRepository.save(userNoteToDelete);
        }

        return ResponseEntity.ok().build();
    }

    public ResponseEntity<?> addUserToNote(Long noteId, ManageUserDto manageUserDto) {

        UserNote userNote = userNoteRepository.findByUserIdAndNoteId(manageUserDto.getUserId(), noteId);

        if(userNote == null){
            return ResponseEntity.notFound().build();
        }
        if(!userNote.getIsUserAdmin()){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        for(Long id : manageUserDto.getUserIds()){
            UserNote userNoteIsAdded = userNoteRepository.findByUserIdAndNoteId(id, noteId);

            if(userNoteIsAdded != null){
                if(userNoteIsAdded.getIsDeleted()){
                    userNoteIsAdded.setIsDeleted(false);
                    userNoteRepository.save(userNoteIsAdded);
                    continue;
                }
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }

            UserNote userNoteToAdd = new UserNote();
            userNoteToAdd.setNoteId(noteId);
            userNoteToAdd.setUserId(id);
            userNoteToAdd.setIsUserAdmin(false);
            userNoteToAdd.setIsDeleted(false);
            userNoteRepository.save(userNoteToAdd);
        }
        return ResponseEntity.ok().build();
    }
}
