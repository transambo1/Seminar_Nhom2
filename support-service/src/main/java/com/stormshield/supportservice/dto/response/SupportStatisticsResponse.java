package com.stormshield.supportservice.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SupportStatisticsResponse {
    private long totalRequests;
    private long pendingRequests;
    private long assignedRequests;
    private long inProgressRequests;
    private long resolvedRequests;
    private long cancelledRequests;
}
