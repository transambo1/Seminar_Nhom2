package com.stormshield.alertservice.external;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExternalAlertSyncResult {
    private String source;
    private int imported;
    private int skipped;
    private int totalReceived;
}
