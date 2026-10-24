package dev.vitalina.portfolio;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.vitalina.portfolio.Model.Portfolio;
import dev.vitalina.portfolio.Model.Project;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.Optional;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

/** Loads portfolio content from portfolio.json once at startup, so content edits never touch code. */
@Service
public class PortfolioService {

    private final ObjectMapper mapper;
    private Portfolio portfolio;

    public PortfolioService(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    @PostConstruct
    void load() throws IOException {
        try (InputStream in = new ClassPathResource("portfolio.json").getInputStream()) {
            this.portfolio = mapper.readValue(in, Portfolio.class);
        }
    }

    public Portfolio get() {
        return portfolio;
    }

    public Optional<Project> findProject(String id) {
        return portfolio.projects().stream().filter(p -> p.id().equals(id)).findFirst();
    }
}
