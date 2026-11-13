import DashboardController from './DashboardController'
import InsightsController from './InsightsController'
import UserController from './UserController'
import FeatureController from './FeatureController'
import ScheduleController from './ScheduleController'
import PromptController from './PromptController'

const Admin = {
    DashboardController: Object.assign(DashboardController, DashboardController),
    InsightsController: Object.assign(InsightsController, InsightsController),
    UserController: Object.assign(UserController, UserController),
    FeatureController: Object.assign(FeatureController, FeatureController),
    ScheduleController: Object.assign(ScheduleController, ScheduleController),
    PromptController: Object.assign(PromptController, PromptController),
}

export default Admin