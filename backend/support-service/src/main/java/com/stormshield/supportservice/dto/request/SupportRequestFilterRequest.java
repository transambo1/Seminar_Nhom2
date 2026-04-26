package com.stormshield.supportservice.dto.request;

import com.stormshield.supportservice.entity.PriorityLevel;
import com.stormshield.supportservice.entity.RequestStatus;
import com.stormshield.supportservice.entity.RequestType;
import com.stormshield.supportservice.entity.RescueRequest;
import com.stormshield.supportservice.specification.SupportRequestSpecification;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.jpa.domain.Specification;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class SupportRequestFilterRequest {
    private RequestStatus status;
    private PriorityLevel priorityLevel;
    private RequestType requestType;
    private String scope;
    private Long userId;
    private Double userLat;
    private Double userLng;
    private String sortBy;
    private String direction;
    private Integer page = 0;
    private Integer size = 10;

    public Specification<RescueRequest> specification() {
        return new SupportRequestSpecification()
                .withStatus(status)
                .withPriorityLevel(priorityLevel)
                .withRequestType(requestType)
                .withScope(scope, userId)
                .build();
    }
}