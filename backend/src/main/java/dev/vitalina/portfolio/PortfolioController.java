package dev.vitalina.portfolio;

import dev.vitalina.portfolio.Model.Portfolio;
import dev.vitalina.portfolio.Model.Project;
import java.util.List;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.Duration;

@RestController
@RequestMapping("/api")
public class PortfolioController {

    private final PortfolioService service;

    public PortfolioController(PortfolioService service) {
        this.service = service;
    }

    @GetMapping("/portfolio")
    public ResponseEntity<Portfolio> portfolio() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofMinutes(10)).cachePublic())
                .body(service.get());
    }

    @GetMapping("/projects")
    public List<Project> projects() {
        return service.get().projects();
    }

    @GetMapping("/projects/{id}")
    public ResponseEntity<Project> project(@PathVariable String id) {
        return service.findProject(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}
