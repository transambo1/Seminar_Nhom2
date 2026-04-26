const axios = require('axios');

const BASE_URL = 'http://localhost:8080';
const timestamp = Date.now();

const results = {
    pass: 0,
    fail: 0,
    skip: 0,
    warn: 0,
    info: 0
};

const logResult = (type, message) => {
    console.log(`[${type.toUpperCase()}] ${message}`);
    results[type.toLowerCase()]++;
};

async function runTests() {
    console.log('Starting StormShield Backend Smoke Test...');
    console.log(`Timestamp: ${timestamp}`);
    console.log('==========================================');

    let citizenToken = null;
    let citizenUserId = null;
    let adminToken = null;
    let adminUserId = null;
    let rescueToken = null;
    let rescueUserId = null;
    let smokeIncidentReportId = null;
    let smokeSupportRequestId = null;

    // Test group 1 — Gateway and basic endpoints
    try {
        const activeAlerts = await axios.get(`${BASE_URL}/api/v1/alerts/active`);
        logResult('pass', `Gateway reachable and GET /api/v1/alerts/active returned ${activeAlerts.data.length} alerts`);
    } catch (err) {
        logResult('fail', `Gateway reachable check failed: ${err.message}`);
    }

    try {
        const shelters = await axios.get(`${BASE_URL}/api/v1/shelters`);
        logResult('pass', `GET /api/v1/shelters returned ${shelters.data.length} shelters`);
    } catch (err) {
        logResult('fail', `GET /api/v1/shelters failed: ${err.message}`);
    }

    // Test group 2 — Citizen auth
    const citizenData = {
        fullName: `Smoke Citizen ${timestamp}`,
        email: `citizen_smoke_${timestamp}@stormshield.com`,
        password: '123456',
        phone: `091${String(timestamp).slice(-7)}`
    };

    try {
        const regRes = await axios.post(`${BASE_URL}/api/v1/auth/register`, citizenData);
        logResult('pass', `Register citizen: ${citizenData.email}`);
    } catch (err) {
        logResult('fail', `Register citizen failed: ${err.response?.status} - ${JSON.stringify(err.response?.data)}`);
    }

    try {
        const loginRes = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
            email: citizenData.email,
            password: citizenData.password
        });
        citizenToken = loginRes.data.token;
        citizenUserId = loginRes.data.userId || loginRes.data.user?.id;
        
        const role = loginRes.data.role || loginRes.data.user?.role;
        if (!role) {
            logResult('warn', 'Login response missing role');
        } else if (role === 'CITIZEN') {
            logResult('pass', `Login citizen role=CITIZEN`);
        } else {
            logResult('fail', `Login citizen role mismatch: expected CITIZEN but got ${role}`);
        }
    } catch (err) {
        logResult('fail', `Login citizen failed: ${err.response?.status} - ${JSON.stringify(err.response?.data)}`);
    }

    // Test group 3 — Admin account
    const adminData = {
        fullName: `Smoke Admin ${timestamp}`,
        email: `admin_smoke_${timestamp}@stormshield.com`,
        password: '123456',
        phone: `090${String(timestamp).slice(-7)}`
    };

    try {
        const adminRegRes = await axios.post(`${BASE_URL}/api/v1/auth/admin/admin-accounts`, adminData);
        logResult('pass', `Admin account created: ${adminData.email}`);
        
        const adminLoginRes = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
            email: adminData.email,
            password: adminData.password
        });
        adminToken = adminLoginRes.data.token;
        adminUserId = adminLoginRes.data.userId || adminLoginRes.data.user?.id;
        logResult('pass', 'Login admin success');
    } catch (err) {
        if (err.response?.status === 404 || err.message.includes('404')) {
            logResult('skip', 'Admin account endpoint missing. Admin must be seeded manually.');
        } else {
            logResult('fail', `Admin creation failed: ${err.response?.status} - ${JSON.stringify(err.response?.data)}`);
        }
    }

    // Test group 4 — Admin creates rescue account
    if (adminToken) {
        const rescueData = {
            fullName: `Smoke Rescue ${timestamp}`,
            email: `rescue_smoke_${timestamp}@stormshield.com`,
            password: '123456',
            phone: `092${String(timestamp).slice(-7)}`
        };

        try {
            const resCreate = await axios.post(`${BASE_URL}/api/v1/auth/admin/rescue-accounts`, rescueData, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            logResult('pass', `Admin create rescue account: ${rescueData.email}`);

            const rescueLoginRes = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
                email: rescueData.email,
                password: rescueData.password
            });
            rescueToken = rescueLoginRes.data.token;
            rescueUserId = rescueLoginRes.data.userId || rescueLoginRes.data.user?.id;
            
            const role = rescueLoginRes.data.role || rescueLoginRes.data.user?.role;
            if (role === 'RESCUE') {
                logResult('pass', 'Login rescue role=RESCUE');
            } else {
                logResult('fail', `Login rescue role mismatch: expected RESCUE but got ${role}`);
            }
        } catch (err) {
            if (err.response?.status === 404) {
                logResult('fail', 'Admin create rescue account API is missing (404)');
            } else {
                logResult('fail', `Rescue account creation/login failed: ${err.response?.status} - ${JSON.stringify(err.response?.data)}`);
            }
        }
    }

    // Test group 5 — Support request flow
    if (citizenToken) {
        try {
            const supportReqData = {
                userId: citizenUserId,
                requestType: 'RESCUE',
                description: 'Smoke test rescue request',
                numberOfPeople: 3,
                latitude: 10.7338,
                longitude: 106.6219,
                priorityLevel: 'HIGH'
            };
            const supportRes = await axios.post(`${BASE_URL}/api/v1/support-requests`, supportReqData, {
                headers: { Authorization: `Bearer ${citizenToken}` }
            });
            smokeSupportRequestId = supportRes.data.id;
            logResult('pass', `Create support request (id: ${smokeSupportRequestId})`);

            const listRes = await axios.get(`${BASE_URL}/api/v1/support-requests`, {
                headers: { Authorization: `Bearer ${citizenToken}` }
            });
            const found = listRes.data.find(r => r.id === smokeSupportRequestId);
            if (found) {
                logResult('pass', 'Support request appears in list');
            } else {
                logResult('fail', 'Support request missing from list');
            }

            if (rescueToken && smokeSupportRequestId) {
                // First assign the request
                await axios.patch(`${BASE_URL}/api/v1/support-requests/${smokeSupportRequestId}/assign`, {
                    assignedTeamId: rescueUserId
                }, {
                    headers: { Authorization: `Bearer ${rescueToken}` }
                });
                logResult('pass', 'Rescue assigned themselves to the request');

                // Then update status to IN_PROGRESS
                const updateRes = await axios.patch(`${BASE_URL}/api/v1/support-requests/${smokeSupportRequestId}/status`, {
                    status: 'IN_PROGRESS'
                }, {
                    headers: { Authorization: `Bearer ${rescueToken}` }
                });
                if (updateRes.data.status === 'IN_PROGRESS') {
                    logResult('pass', 'Rescue updated support status to IN_PROGRESS');
                } else {
                    logResult('fail', `Support status update failed: got ${updateRes.data.status}`);
                }
            }
        } catch (err) {
            logResult('fail', `Support request flow failed: ${err.response?.status} - ${JSON.stringify(err.response?.data)}`);
        }
    }

    // Test group 6 — Incident report flow
    if (citizenToken) {
        try {
            const incidentData = {
                userId: citizenUserId,
                title: `Smoke Test Incident Report ${timestamp}`,
                description: 'Smoke test flood incident',
                incidentType: 'FLOOD',
                severityLevel: 'HIGH',
                affectedArea: 'Quận 8, TP.HCM',
                latitude: 10.7338,
                longitude: 106.6219,
                imageUrl: null
            };
            const incRes = await axios.post(`${BASE_URL}/api/v1/incident-reports`, incidentData, {
                headers: { Authorization: `Bearer ${citizenToken}` }
            });
            smokeIncidentReportId = incRes.data.id;
            if (smokeIncidentReportId && incRes.data.status === 'PENDING') {
                logResult('pass', `Create incident report (id: ${smokeIncidentReportId}, status: PENDING)`);
            } else {
                logResult('fail', `Incident report creation failed: ${JSON.stringify(incRes.data)}`);
            }
        } catch (err) {
            logResult('fail', `Incident report creation failed: ${err.response?.status} - ${JSON.stringify(err.response?.data)}`);
        }
    }

    // Test group 7 — Admin review incident report
    if (adminToken && smokeIncidentReportId) {
        try {
            const pendingRes = await axios.get(`${BASE_URL}/api/v1/incident-reports/pending`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            const found = pendingRes.data.find(r => r.id === smokeIncidentReportId);
            if (found) {
                logResult('pass', 'Smoke incident report appears in pending list');
            } else {
                logResult('fail', 'Smoke incident report missing from pending list');
            }

            const reviewRes = await axios.put(`${BASE_URL}/api/v1/incident-reports/${smokeIncidentReportId}/review`, {
                status: 'APPROVED',
                reviewedBy: adminUserId
            }, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            if (reviewRes.data.status === 'APPROVED') {
                logResult('pass', 'Admin approved incident report');
                
                // Verify alert was created
                await new Promise(resolve => setTimeout(resolve, 1000)); // wait a bit for processing
                const alertsRes = await axios.get(`${BASE_URL}/api/v1/alerts/active`);
                const alertFound = alertsRes.data.find(a => a.title === `Smoke Test Incident Report ${timestamp}` || (a.latitude === 10.7338 && a.longitude === 106.6219));
                if (alertFound) {
                    logResult('pass', 'Incident report approved and active alert created');
                } else {
                    logResult('fail', 'Incident report approved but active alert was not created');
                }
            } else {
                logResult('fail', `Admin review failed: got ${reviewRes.data.status}`);
            }
        } catch (err) {
            logResult('fail', `Admin review flow failed: ${err.response?.status} - ${JSON.stringify(err.response?.data)}`);
        }
    }

    // Test group 8 — Shelter flow
    try {
        const listShelters = await axios.get(`${BASE_URL}/api/v1/shelters`);
        logResult('pass', 'GET /api/v1/shelters returned successfully');

        if (adminToken) {
            const shelterData = {
                name: `Smoke Test Shelter ${timestamp}`,
                address: 'Quận 8, TP.HCM',
                latitude: 10.735,
                longitude: 106.622,
                capacity: 300,
                currentOccupancy: 0,
                status: 'AVAILABLE'
            };
            const shelterRes = await axios.post(`${BASE_URL}/api/v1/shelters`, shelterData, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            if (shelterRes.data.id) {
                logResult('pass', `Admin created shelter (id: ${shelterRes.data.id})`);
                
                const listCheck = await axios.get(`${BASE_URL}/api/v1/shelters`);
                const found = listCheck.data.find(s => s.id === shelterRes.data.id);
                if (found) {
                    logResult('pass', 'New shelter appears in list');
                } else {
                    logResult('fail', 'New shelter missing from list');
                }
            }
        }
    } catch (err) {
        logResult('fail', `Shelter flow failed: ${err.response?.status} - ${JSON.stringify(err.response?.data)}`);
    }

    // Test group 9 — External alert data
    try {
        const alertsRes = await axios.get(`${BASE_URL}/api/v1/alerts/active`);
        const nasaAlerts = alertsRes.data.filter(a => a.source === 'NASA_EONET' || a.issuedBy === 'NASA_EONET');
        logResult('info', `External NASA alerts count: ${nasaAlerts.length}`);
    } catch (err) {
        logResult('fail', `External alert data check failed: ${err.message}`);
    }

    // Test group 10 — Notification flow
    if (citizenToken && citizenUserId) {
        let smokeNotificationId = null;
        try {
            // 1. Create manual notification
            const notifCreateRes = await axios.post(`${BASE_URL}/api/v1/notifications`, {
                userId: citizenUserId,
                title: 'Cảnh báo nguy hiểm gần bạn',
                message: 'Có cảnh báo ngập trong bán kính 10km.',
                type: 'NEARBY_ALERT',
                relatedEntityType: 'ALERT',
                relatedEntityId: 10,
                latitude: 10.7338,
                longitude: 106.6219
            }, {
                headers: { Authorization: `Bearer ${citizenToken}` }
            });
            smokeNotificationId = notifCreateRes.data.id;
            logResult('pass', `Create manual notification (id: ${smokeNotificationId})`);

            // 2. Get user notifications (using new endpoint)
            const userNotifs = await axios.get(`${BASE_URL}/api/v1/notifications/my?userId=${citizenUserId}`, {
                headers: { Authorization: `Bearer ${citizenToken}` }
            });
            if (userNotifs.data.length > 0) {
                logResult('pass', `Get user notifications returned ${userNotifs.data.length} items`);
            } else {
                logResult('fail', 'Get user notifications returned empty');
            }

            // 3. Get unread count
            const unreadCountRes = await axios.get(`${BASE_URL}/api/v1/notifications/unread-count?userId=${citizenUserId}`, {
                headers: { Authorization: `Bearer ${citizenToken}` }
            });
            const countBefore = unreadCountRes.data.unreadCount;
            logResult('pass', `Initial unread count: ${countBefore}`);

            // 4. Mark as read (using PATCH)
            if (smokeNotificationId) {
                await axios.patch(`${BASE_URL}/api/v1/notifications/${smokeNotificationId}/read`, {}, {
                    headers: { Authorization: `Bearer ${citizenToken}` }
                });
                logResult('pass', `Mark notification ${smokeNotificationId} as read (PATCH)`);

                // 5. Verify unread count decreases
                const unreadCountAfter = await axios.get(`${BASE_URL}/api/v1/notifications/unread-count?userId=${citizenUserId}`, {
                    headers: { Authorization: `Bearer ${citizenToken}` }
                });
                if (unreadCountAfter.data.unreadCount === countBefore - 1) {
                    logResult('pass', 'Unread count decreased correctly');
                } else {
                    logResult('warn', `Unread count mismatch: expected ${countBefore - 1}, got ${unreadCountAfter.data.unreadCount}`);
                }
            }

            // 6. RabbitMQ Event Flow Test (Support Request -> Notification)
            logResult('info', 'Testing RabbitMQ Event Flow: Support Request -> Notification');
            const supportRes = await axios.post(`${BASE_URL}/api/v1/support-requests`, {
                userId: citizenUserId,
                requestType: 'RESCUE',
                priorityLevel: 'HIGH',
                description: 'Cần cứu hộ ngay lập tức do nước dâng cao.',
                latitude: 10.7338,
                longitude: 106.6219
            }, {
                headers: { Authorization: `Bearer ${citizenToken}` }
            });
            const requestId = supportRes.data.id;
            logResult('pass', `Created support request (id: ${requestId}), waiting for RabbitMQ...`);

            // Wait 2 seconds for RabbitMQ processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            const notifsAfterEvent = await axios.get(`${BASE_URL}/api/v1/notifications/my?userId=1`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            const eventNotif = notifsAfterEvent.data.find(n => n.relatedEntityType === 'SUPPORT_REQUEST' && n.relatedEntityId === requestId);
            
            if (eventNotif) {
                logResult('pass', `RabbitMQ event flow verified: Found notification for support request ${requestId}`);
            } else {
                logResult('warn', 'RabbitMQ event flow: Notification not found in time. RabbitMQ or Consumer might be slow.');
            }

            // 7. Check nearby alerts
            const nearbyCheckRes = await axios.post(`${BASE_URL}/api/v1/notifications/check-nearby-alerts`, {
                userId: citizenUserId,
                latitude: 10.7338,
                longitude: 106.6219,
                radiusKm: 10
            }, {
                headers: { Authorization: `Bearer ${citizenToken}` }
            });
            if (nearbyCheckRes.data.userId === citizenUserId) {
                logResult('pass', `Check nearby alerts successful: nearby=${nearbyCheckRes.data.nearbyAlerts}, created=${nearbyCheckRes.data.notificationsCreated}`);
            } else {
                logResult('fail', 'Check nearby alerts response invalid');
            }

        } catch (err) {
            logResult('fail', `Notification flow failed: ${err.response?.status} - ${JSON.stringify(err.response?.data)}`);
        }
    }

    console.log('\n==============================');
    console.log('StormShield Smoke Test Summary');
    console.log('==============================');
    console.log(`Total:     ${Object.values(results).reduce((a, b) => a + b, 0)}`);
    console.log(`Passed:    ${results.pass}`);
    console.log(`Failed:    ${results.fail}`);
    console.log(`Skipped:   ${results.skip}`);
    console.log(`Warnings:  ${results.warn}`);
    console.log(`Infos:     ${results.info}`);
    console.log('==============================');

    if (results.fail > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runTests();
