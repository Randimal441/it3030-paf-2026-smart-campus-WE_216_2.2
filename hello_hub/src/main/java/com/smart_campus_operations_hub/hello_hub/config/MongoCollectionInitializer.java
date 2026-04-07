package com.smart_campus_operations_hub.hello_hub.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MongoCollectionInitializer {

    private final MongoTemplate mongoTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void ensureCollectionsExist() {
        if (!mongoTemplate.collectionExists("resources")) {
            mongoTemplate.createCollection("resources");
        }
    }
}
