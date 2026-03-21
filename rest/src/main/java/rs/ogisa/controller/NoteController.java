package rs.ogisa.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import rs.ogisa.dto.CreateNoteDto;
import rs.ogisa.dto.EditNoteDto;
import rs.ogisa.models.Note;
import rs.ogisa.models.UserNote;
import rs.ogisa.services.NoteService;

import java.util.List;

@RestController
@CrossOrigin
@AllArgsConstructor
@RequestMapping("/api/v1/note")
public class NoteController {

    private NoteService noteService;
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/createNote/{userId}")
    public ResponseEntity<Void> createNote(@PathVariable Long userId, @RequestBody CreateNoteDto createNoteDto) {

        if (!noteService.createNote(userId, createNoteDto)) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok().build();
    }

    @GetMapping("/getNoteById/{noteId}")
    public Note getNoteById(@PathVariable Long noteId) {
        return noteService.getNoteById(noteId);
    }

    @GetMapping("/getAllUserNote")
    public List<UserNote> getAllUserNote() {
        return noteService.getAllUserNote();
    }

    @GetMapping("/getAllNote")
    public List<Note> getAllNotes() {
        return noteService.getAllNotes();
    }

    @GetMapping("/getAllNoteByUserId/{userId}")
    public List<Note> getAllNotes(@PathVariable Long userId) {
        return noteService.getAllNotesByUserId(userId);
    }

    @GetMapping("/deleteNoteById/{noteId}")
    public ResponseEntity<?> deleteNoteById(@PathVariable Long noteId) {
        return noteService.deleteNoteById(noteId);
    }

    @MessageMapping("/update-note")
    public void changeNoteContent(EditNoteDto editNoteDto) {
        Note changedNote = noteService.sendContentToUserNote(editNoteDto);
        messagingTemplate.convertAndSend("/topic/note/" + changedNote.getNoteId(), changedNote);
    }

    // ── Admin endpoints ───────────────────────────────────────────────────────

    @GetMapping("/admin/getAllNotes")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATOR')")
    public List<Note> adminGetAllNotes() {
        return noteService.getAllNotes();
    }

    @DeleteMapping("/admin/delete/{noteId}")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATOR')")
    public ResponseEntity<?> adminDeleteNote(@PathVariable Long noteId) {
        return noteService.adminDeleteNote(noteId);
    }
}
