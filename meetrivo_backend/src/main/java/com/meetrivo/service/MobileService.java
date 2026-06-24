package com.meetrivo.service;

import com.meetrivo.model.MobileDevice;
import com.meetrivo.model.MobilePlatform;
import com.meetrivo.model.AnalyticsEventType;
import com.meetrivo.notification.PushNotificationService;
import com.meetrivo.repository.MobileDeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MobileService extends BaseService {

    private final MobileDeviceRepository mobileDeviceRepository;
    private final PushNotificationService pushNotificationService;
    private final AnalyticsService analyticsService;

    public MobileDevice registerDevice(String userId, String deviceToken, MobilePlatform platform, String deviceName) {
        // Upsert — if already registered with same token, update
        MobileDevice device = mobileDeviceRepository.findByUserIdAndDeviceToken(userId, deviceToken)
                .orElse(MobileDevice.builder()
                        .userId(userId)
                        .deviceToken(deviceToken)
                        .registeredAt(LocalDateTime.now())
                        .build());

        device.setPlatform(platform);
        device.setDeviceName(deviceName != null ? deviceName : platform.name() + " Device");
        device.setRegisteredAt(LocalDateTime.now());

        MobileDevice saved = mobileDeviceRepository.save(device);
        logInfo("Mobile device registered for user: " + userId + ", platform: " + platform);
        return saved;
    }

    public void removeDevice(String userId, String deviceToken) {
        if (!mobileDeviceRepository.findByUserIdAndDeviceToken(userId, deviceToken).isPresent()) {
            throw new RuntimeException("Device token not found for user");
        }
        mobileDeviceRepository.deleteByUserIdAndDeviceToken(userId, deviceToken);
        logInfo("Mobile device removed for user: " + userId + ", token: " + deviceToken);
    }

    public void sendPushNotification(String userId, String title, String body, String type) {
        List<MobileDevice> devices = mobileDeviceRepository.findByUserId(userId);
        if (devices.isEmpty()) {
            logInfo("No registered devices for user: " + userId + ". Notification skipped.");
            return;
        }

        for (MobileDevice device : devices) {
            try {
                pushNotificationService.sendToDevice(
                        device.getDeviceToken(),
                        device.getPlatform().name(),
                        title,
                        body,
                        java.util.Map.of("type", type != null ? type : "GENERAL")
                );
            } catch (Exception e) {
                logError("Failed to send push notification to device: " + device.getDeviceToken(), e);
            }
        }

        analyticsService.trackEvent(AnalyticsEventType.PUSH_NOTIFICATION_SENT, userId, null, null);
        logInfo("Push notification sent to " + devices.size() + " devices for user: " + userId);
    }

    public List<MobileDevice> getUserDevices(String userId) {
        return mobileDeviceRepository.findByUserId(userId);
    }

    public void sendTestNotification(String userId, String deviceToken) {
        MobileDevice device = mobileDeviceRepository.findByUserIdAndDeviceToken(userId, deviceToken)
                .orElseThrow(() -> new RuntimeException("Device not found"));
        pushNotificationService.sendTestNotification(device.getDeviceToken(), device.getPlatform().name());
        logInfo("Test push notification sent to device: " + deviceToken);
    }
}
