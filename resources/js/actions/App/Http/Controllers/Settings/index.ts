import ProfileController from './ProfileController'
import PrivacyController from './PrivacyController'
import SecurityController from './SecurityController'
import ThemeController from './ThemeController'
import NotificationController from './NotificationController'
import PushSubscriptionController from './PushSubscriptionController'
import LocationController from './LocationController'
import SharedLinksController from './SharedLinksController'

const Settings = {
    ProfileController: Object.assign(ProfileController, ProfileController),
    PrivacyController: Object.assign(PrivacyController, PrivacyController),
    SecurityController: Object.assign(SecurityController, SecurityController),
    ThemeController: Object.assign(ThemeController, ThemeController),
    NotificationController: Object.assign(NotificationController, NotificationController),
    PushSubscriptionController: Object.assign(PushSubscriptionController, PushSubscriptionController),
    LocationController: Object.assign(LocationController, LocationController),
    SharedLinksController: Object.assign(SharedLinksController, SharedLinksController),
}

export default Settings