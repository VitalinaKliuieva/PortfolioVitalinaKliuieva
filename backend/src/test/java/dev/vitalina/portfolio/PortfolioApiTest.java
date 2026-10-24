package dev.vitalina.portfolio;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class PortfolioApiTest {

    @Autowired MockMvc mvc;

    @Test
    void returnsPortfolio() throws Exception {
        mvc.perform(get("/api/portfolio"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profile.name").value("Vitalina Kliuieva"))
                .andExpect(jsonPath("$.projects").isNotEmpty());
    }

    @Test
    void unknownProjectIs404() throws Exception {
        mvc.perform(get("/api/projects/does-not-exist")).andExpect(status().isNotFound());
    }

    @Test
    void invalidContactIs400() throws Exception {
        mvc.perform(post("/api/contact").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"email\":\"nope\",\"message\":\"short\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void validContactIsAccepted() throws Exception {
        mvc.perform(post("/api/contact").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Anna\",\"email\":\"anna@example.com\",\"message\":\"Hello, we have a role for you.\"}"))
                .andExpect(status().isAccepted());
    }
}
