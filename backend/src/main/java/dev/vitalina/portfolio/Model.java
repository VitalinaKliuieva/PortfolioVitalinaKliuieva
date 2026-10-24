package dev.vitalina.portfolio;

import java.util.List;

public final class Model {
    private Model() {}

    public record Profile(String name, String title, String tagline, String summary, String location,
                          String email, String github, String linkedin, String education,
                          List<String> languages, List<String> keywords) {}

    public record Project(String id, String title, String subtitle, String category, String period,
                          String summary, String problem, List<String> highlights, List<String> stack,
                          String repoUrl, String liveUrl) {}

    public record Experience(String role, String org, String period, String description, List<String> points) {}

    public record SkillGroup(String name, List<String> items) {}

    public record Portfolio(Profile profile, List<Project> projects, List<Experience> experience,
                            List<SkillGroup> skills) {}
}
