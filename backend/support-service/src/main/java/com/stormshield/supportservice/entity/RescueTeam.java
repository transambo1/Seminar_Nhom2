package com.stormshield.supportservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "rescue_teams")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RescueTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String area;

    @Column(nullable = false)
    private String phone;

    private Double latitude;

    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RescueTeamStatus status;

    @Column(nullable = false)
    private Long leaderId;

    private Integer capacity;

    private Integer currentLoad;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
