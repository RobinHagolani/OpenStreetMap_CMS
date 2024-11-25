package com.example.demo_OpenStreetMap.controller;

import com.example.demo_OpenStreetMap.model.PinPoint;
import com.example.demo_OpenStreetMap.repository.PinPointRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
public class PinPointController {

    @Autowired
    private PinPointRepository pinPointRepository;

    @GetMapping("/api/pinpoints")
    public List<PinPoint> getAllPinPoints() {
        return pinPointRepository.findAll();
    }

    @PutMapping("/edit-pin/{id}")
    @ResponseBody
    public String editPin(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Optional<PinPoint> optionalPinPoint = pinPointRepository.findById(id);
        if (optionalPinPoint.isPresent()) {
            PinPoint pinPoint = optionalPinPoint.get();
            pinPoint.setName(payload.get("name"));
            pinPoint.setDescription(payload.get("description"));
            pinPointRepository.save(pinPoint);
            return "Pin updated successfully";
        }
        return "Pin not found";
    }

    @DeleteMapping("/delete-pin/{id}")
    @ResponseBody
    public String deletePin(@PathVariable Long id) {
        if (pinPointRepository.existsById(id)) {
            pinPointRepository.deleteById(id);
            return "Pin deleted successfully";
        }
        return "Pin not found";
    }

}
