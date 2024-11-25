package com.example.demo_OpenStreetMap.controller;

import com.example.demo_OpenStreetMap.model.PinPoint;
import com.example.demo_OpenStreetMap.repository.PinPointRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
public class MapController {
    @Autowired
    private PinPointRepository pinPointRepository;

    @GetMapping
    public String showMap(Model model) {
        List<PinPoint> pinpoints = pinPointRepository.findAll();
        model.addAttribute("pinpoints", pinpoints);
        return "index";
    }

    @PostMapping("/add-pin")
    @ResponseBody
    public String addPin(@RequestBody Map<String, Object> payload) {
        PinPoint pinPoint = new PinPoint();
        pinPoint.setLat((Double) payload.get("lat"));
        pinPoint.setLng((Double) payload.get("lng"));
        pinPoint.setName((String) payload.get("name"));
        pinPoint.setDescription((String) payload.get("description"));
        pinPointRepository.save(pinPoint);
        return "Pin added with details";
    }


}
