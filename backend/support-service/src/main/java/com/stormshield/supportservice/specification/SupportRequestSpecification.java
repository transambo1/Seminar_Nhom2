package com.stormshield.supportservice.specification;

import com.stormshield.supportservice.entity.PriorityLevel;
import com.stormshield.supportservice.entity.RequestStatus;
import com.stormshield.supportservice.entity.RequestType;
import com.stormshield.supportservice.entity.RescueRequest;
import org.springframework.data.jpa.domain.Specification;

public class SupportRequestSpecification {

    private Specification<RescueRequest> spec = Specification.where(null);

    public SupportRequestSpecification withStatus(RequestStatus status) {
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        return this;
    }

    public SupportRequestSpecification withPriorityLevel(PriorityLevel priorityLevel) {
        if (priorityLevel != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("priorityLevel"), priorityLevel));
        }
        return this;
    }

    public SupportRequestSpecification withRequestType(RequestType requestType) {
        if (requestType != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("requestType"), requestType));
        }
        return this;
    }

    public SupportRequestSpecification withScope(String scope, Long userId) {
        if (userId == null) {
            return this;
        }

        if (scope == null) {
            scope = "MINE";
        }

        if ("ALL".equalsIgnoreCase(scope)) {
            return this;
        }

        if ("OTHERS".equalsIgnoreCase(scope)) {
            spec = spec.and((root, query, cb) -> cb.notEqual(root.get("userId"), userId));
        } else {
            // Default to MINE for "MINE" or any unexpected value
            spec = spec.and((root, query, cb) -> cb.equal(root.get("userId"), userId));
        }
        
        return this;
    }

    public Specification<RescueRequest> build() {
        return spec;
    }
}
