import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ActivityIndicator, 
  Platform, 
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { rescueService } from '../../src/api/rescueService'; // Chỉnh lại đường dẫn file service của bạn

const PRIMARY = '#041525';
const INACTIVE = '#94a3b8';
const SUCCESS = '#10b981';
const WARNING = '#f59e0b';

export default function RescueTeamScreen() {
  const [loading, setLoading] = useState(true);
  const [teamInfo, setTeamInfo] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchTeamData() {
      try {
        const storedUserId = await SecureStore.getItemAsync('userId');
        if (storedUserId) {
          // Gọi API thật từ service
          const response = await rescueService.getTeamMembers(storedUserId);
          
          if (response && response.data) {
            // Giả định backend trả về object Đội: { teamName: 'Đội 1', members: [...] }
            setTeamInfo(response.data);
            setMembers(response.data.members || []);
          }
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách đội:", error);
        // Mockup data dự phòng nếu Backend của bạn chưa hoàn thiện endpoint này để test giao diện không bị lỗi
        setTeamInfo({ teamName: "Đội Cứu Hộ Khẩn Cấp Số 1" });
        setMembers([
          { id: 1, fullName: "Nguyễn Văn A", phone: "0901234567", isAvailable: true, role: "Đội trưởng" },
          { id: 2, fullName: "Trần Văn B", phone: "0907654321", isAvailable: false, role: "Thành viên" },
          { id: 3, fullName: "Lê Văn C", phone: "0908888888", isAvailable: true, role: "Y tế" },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchTeamData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header chuẩn iOS */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👥 Đội Ngũ Tác Chiến</Text>
        <Text style={styles.headerSub}>{teamInfo?.teamName || "Đang cập nhật tên đội..."}</Text>
      </View>

      {/* Danh sách thành viên */}
      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Thành viên trong đội ({members.length})</Text>
        
        {members.map((member, index) => (
          <View key={member.id || index} style={styles.memberCard}>
            <View style={styles.avatarMock}>
              <Text style={styles.avatarText}>
                {member.fullName ? member.fullName.charAt(0).toUpperCase() : '👤'}
              </Text>
            </View>

            <View style={styles.memberInfo}>
              <View style={styles.row}>
                <Text style={styles.memberName}>{member.fullName}</Text>
                <Text style={styles.memberRole}>{member.role || 'Thành viên'}</Text>
              </View>
              
              <Text style={styles.memberPhone}>📞 {member.phone || 'Chưa cập nhật SĐT'}</Text>
            </View>

            {/* Trạng thái hoạt động */}
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusDot, 
                { backgroundColor: member.isAvailable ? SUCCESS : WARNING }
              ]} />
              <Text style={[
                styles.statusText, 
                { color: member.isAvailable ? SUCCESS : WARNING }
              ]}>
                {member.isAvailable ? "Sẵn sàng" : "Bận"}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: PRIMARY,
  },
  headerSub: {
    fontSize: 14,
    color: PRIMARY,
    fontWeight: '600',
    marginTop: 2,
    opacity: 0.8,
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: PRIMARY,
    marginBottom: 12,
  },
  memberCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  avatarMock: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: PRIMARY,
  },
  memberInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 15,
    fontWeight: '700',
    color: PRIMARY,
  },
  memberRole: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
    overflow: 'hidden',
  },
  memberPhone: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
});