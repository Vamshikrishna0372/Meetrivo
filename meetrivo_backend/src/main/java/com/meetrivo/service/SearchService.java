package com.meetrivo.service;

import com.meetrivo.model.*;
import com.meetrivo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SearchService extends BaseService {

    private final MongoTemplate mongoTemplate;

    public Map<String, Object> globalSearch(String keyword) {
        Map<String, Object> results = new HashMap<>();
        if (keyword == null || keyword.trim().isEmpty()) {
            return results;
        }

        String regex = "(?i)" + keyword; // Case-insensitive regex match

        // 1. Search Meetings
        Query meetingQuery = new Query();
        meetingQuery.addCriteria(new Criteria().orOperator(
                Criteria.where("title").regex(regex),
                Criteria.where("description").regex(regex),
                Criteria.where("meetingCode").regex(regex)
        ));
        meetingQuery.limit(20);
        List<Meeting> meetings = mongoTemplate.find(meetingQuery, Meeting.class);
        results.put("meetings", meetings);

        // 2. Search Users
        Query userQuery = new Query();
        userQuery.addCriteria(new Criteria().orOperator(
                Criteria.where("fullName").regex(regex),
                Criteria.where("username").regex(regex),
                Criteria.where("email").regex(regex)
        ));
        userQuery.limit(20);
        List<User> users = mongoTemplate.find(userQuery, User.class);
        // Remove passwords before returning
        users.forEach(u -> u.setPassword(null));
        results.put("users", users);

        // 3. Search Organizations
        Query orgQuery = new Query();
        orgQuery.addCriteria(new Criteria().orOperator(
                Criteria.where("name").regex(regex),
                Criteria.where("description").regex(regex)
        ));
        orgQuery.limit(20);
        List<Organization> orgs = mongoTemplate.find(orgQuery, Organization.class);
        results.put("organizations", orgs);

        // 4. Search Teams
        Query teamQuery = new Query();
        teamQuery.addCriteria(new Criteria().orOperator(
                Criteria.where("name").regex(regex),
                Criteria.where("description").regex(regex)
        ));
        teamQuery.limit(20);
        List<Team> teams = mongoTemplate.find(teamQuery, Team.class);
        results.put("teams", teams);

        // 5. Search Departments
        Query deptQuery = new Query();
        deptQuery.addCriteria(new Criteria().orOperator(
                Criteria.where("name").regex(regex),
                Criteria.where("description").regex(regex)
        ));
        deptQuery.limit(20);
        List<Department> depts = mongoTemplate.find(deptQuery, Department.class);
        results.put("departments", depts);

        // 6. Search Chat Messages
        Query chatQuery = new Query();
        chatQuery.addCriteria(Criteria.where("message").regex(regex));
        chatQuery.limit(20);
        List<ChatMessage> chats = mongoTemplate.find(chatQuery, ChatMessage.class);
        results.put("chatMessages", chats);

        // 7. Search Recordings
        Query recQuery = new Query();
        recQuery.addCriteria(new Criteria().orOperator(
                Criteria.where("title").regex(regex),
                Criteria.where("description").regex(regex)
        ));
        recQuery.limit(20);
        List<MeetingRecording> recordings = mongoTemplate.find(recQuery, MeetingRecording.class);
        results.put("recordings", recordings);

        // 8. Search Transcripts
        Query transQuery = new Query();
        transQuery.addCriteria(Criteria.where("transcriptText").regex(regex));
        transQuery.limit(20);
        List<MeetingTranscript> transcripts = mongoTemplate.find(transQuery, MeetingTranscript.class);
        results.put("transcripts", transcripts);

        return results;
    }
}
