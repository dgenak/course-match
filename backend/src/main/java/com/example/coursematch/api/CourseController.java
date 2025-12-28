package com.example.coursematch.api;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class CourseController {

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/compare")
    public Map<String, Double> compareCourses(@RequestBody Map<String, Object> body) {
        String pythonUrl = "http://127.0.0.1:8000/compare";

        Map response = restTemplate.postForObject(
            pythonUrl,
            body,
            Map.class
        );

        double similarity = Double.parseDouble(response.get("similarity").toString());
        return Map.of("similarity", similarity);
    }

    // ✅ ΕΔΩ ΜΕΣΑ
    @GetMapping("/standard-courses")
    public List<Map<String, String>> getStandardCourses() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        InputStream is = new ClassPathResource("data/standard_courses.json").getInputStream();

        Map<String, List<Map<String, String>>> data =
            mapper.readValue(is, new TypeReference<>() {});

        return data.get("courses");
    }
}
