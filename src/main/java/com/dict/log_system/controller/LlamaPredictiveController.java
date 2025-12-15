package com.dict.log_system.controller;


import okhttp3.*;
import okhttp3.RequestBody;

import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/api")
public class LlamaPredictiveController {

    private static final String LLAMA_SERVER_URL = "http://localhost:5000/generate";

    @GetMapping("/predict")
    public List<String> predictPurpose(@RequestParam String input) throws IOException {
        if (input == null || input.isBlank()) {
            return Collections.emptyList();
        }

        // Build the prompt for LLaMA
        String prompt = "The visitor typed: \"" + input + "\"\n" +
                        "Suggest 5 possible visitor purposes, comma-separated.";

        // Define JSON MediaType
        MediaType JSON = MediaType.get("application/json; charset=utf-8");

        // Build the request body
        String jsonBody = "{ \"prompt\": \"" + prompt + "\", \"max_tokens\": 50 }";
        RequestBody body = RequestBody.create(jsonBody, JSON);

        // Build the HTTP request
        Request request = new Request.Builder()
                .url(LLAMA_SERVER_URL)
                .post(body)
                .build();

        // Execute request
        OkHttpClient client = new OkHttpClient();
        Response response = client.newCall(request).execute();

        if (!response.isSuccessful()) {
            return Collections.emptyList();
        }

        String output = response.body().string();

        // Parse LLaMA output: split by commas and trim whitespace
        String[] suggestions = output.split(",");
        List<String> result = new ArrayList<>();
        for (String s : suggestions) {
            if (!s.isBlank()) {
                result.add(s.trim());
            }
        }

        return result;
    }
}
