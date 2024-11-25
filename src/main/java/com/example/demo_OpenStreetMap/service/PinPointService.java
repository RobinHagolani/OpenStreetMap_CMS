package com.example.demo_OpenStreetMap.service;

import com.example.demo_OpenStreetMap.model.PinPoint;
import com.example.demo_OpenStreetMap.repository.PinPointRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PinPointService {

    @Autowired
    private PinPointRepository pinPointRepository;

    public List<PinPoint> getAllPinPoints() {
        return pinPointRepository.findAll();
    }

    public PinPoint addPinPoint(PinPoint pinPoint) {
        return pinPointRepository.save(pinPoint);
    }

    public Optional<PinPoint> getPinPointById(Long id) {
        return pinPointRepository.findById(id);
    }

    public void deletePinPoint(Long id) {
        pinPointRepository.deleteById(id);
    }
}
