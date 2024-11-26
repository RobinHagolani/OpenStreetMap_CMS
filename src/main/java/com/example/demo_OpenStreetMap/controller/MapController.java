package com.example.demo_OpenStreetMap.controller;


import com.example.demo_OpenStreetMap.model.Location;
import com.example.demo_OpenStreetMap.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Optional;


@Controller
public class MapController {

    @Autowired
    private LocationRepository locationRepository;

    @GetMapping("/")
    public String showMap(Model model) {
        List<Location> pinpoints = locationRepository.findAll();
        model.addAttribute("pinpoints", pinpoints); // Send pinpoints to the frontend
        return "index";
    }

    @GetMapping("/api/pinpoints")
    @ResponseBody
    public List<Location> getAllPinpoints() {
        return locationRepository.findAll(); // Fetch all pinpoints as JSON for the map
    }

    @PostMapping("/add-pin")
    @ResponseBody
    public Location addPin(@RequestBody Map<String, Object> payload) {
        Location pinPoint = new Location();
        pinPoint.setLatitude((Double) payload.get("lat"));
        pinPoint.setLongitude((Double) payload.get("lng"));
        pinPoint.setCity((String) payload.get("name"));
        pinPoint.setDescription((String) payload.get("description"));
        locationRepository.save(pinPoint);
        return pinPoint; // Return the full saved object
    }


    @PutMapping("/edit-pin/{id}")
    @ResponseBody
    public Map<String, String> editLocation(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Optional<Location> optionalLocation = locationRepository.findById(id);
        if (optionalLocation.isPresent()) {
            Location location = optionalLocation.get();
            location.setCity(payload.get("name"));
            location.setDescription(payload.get("description"));
            locationRepository.save(location);

            // Return a JSON success response
            return Map.of("message", "Pin updated successfully");
        }
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pin not found");
    }


    @DeleteMapping("/delete-pin/{id}")
    @ResponseBody
    public String deletePin(@PathVariable Long id) {
        if (locationRepository.existsById(id)) {
            locationRepository.deleteById(id);
            return "Pin deleted successfully";
        }
        return "Pin not found";
    }
}
