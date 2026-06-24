package com.meetrivo.repository;

import com.meetrivo.model.Report;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends MongoRepository<Report, String> {
    List<Report> findByReportTypeOrderByGeneratedAtDesc(String reportType);
}
