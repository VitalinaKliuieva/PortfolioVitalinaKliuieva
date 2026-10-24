package dev.vitalina.portfolio;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private static final Logger log = LoggerFactory.getLogger(ContactController.class);
    private static final Duration MIN_INTERVAL = Duration.ofSeconds(30);

    public record ContactRequest(@NotBlank @Size(max = 80) String name,
                                 @NotBlank @Email @Size(max = 120) String email,
                                 @NotBlank @Size(min = 10, max = 2000) String message,
                                 String website) {} // "website" is a honeypot field bots fill in

    private final Map<String, Instant> lastSeen = new ConcurrentHashMap<>();

    @PostMapping
    public ResponseEntity<Void> send(@Valid @RequestBody ContactRequest req) {
        if (req.website() != null && !req.website().isBlank()) {
            return ResponseEntity.accepted().build(); // silently drop bots
        }
        Instant now = Instant.now();
        Instant previous = lastSeen.put(req.email().toLowerCase(), now);
        if (previous != null && Duration.between(previous, now).compareTo(MIN_INTERVAL) < 0) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
        }
        // Replace with Spring Mail / a webhook when you deploy; kept as a log line to stay dependency-light.
        log.info("Contact message from {} <{}>: {}", req.name(), req.email(), req.message());
        return ResponseEntity.accepted().build();
    }
}
