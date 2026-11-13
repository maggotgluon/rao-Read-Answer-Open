import LocaleController from './LocaleController'
import ChangelogController from './ChangelogController'
import LegalController from './LegalController'
import ShareController from './ShareController'
import InviteController from './InviteController'
import ConsentController from './ConsentController'
import SpaceController from './SpaceController'
import AnalyticsController from './AnalyticsController'
import SurveyController from './SurveyController'
import MomentMediaController from './MomentMediaController'
import AnswerController from './AnswerController'
import RatingController from './RatingController'
import NudgeController from './NudgeController'
import LetterReplyController from './LetterReplyController'
import MoodController from './MoodController'
import PlaceController from './PlaceController'
import PromptController from './PromptController'
import SpaceEventController from './SpaceEventController'
import MomentController from './MomentController'
import MomentDateController from './MomentDateController'
import MomentReactionController from './MomentReactionController'
import MomentCommentController from './MomentCommentController'
import Admin from './Admin'
import Settings from './Settings'
import OpsController from './OpsController'
import SeoController from './SeoController'

const Controllers = {
    LocaleController: Object.assign(LocaleController, LocaleController),
    ChangelogController: Object.assign(ChangelogController, ChangelogController),
    LegalController: Object.assign(LegalController, LegalController),
    ShareController: Object.assign(ShareController, ShareController),
    InviteController: Object.assign(InviteController, InviteController),
    ConsentController: Object.assign(ConsentController, ConsentController),
    SpaceController: Object.assign(SpaceController, SpaceController),
    AnalyticsController: Object.assign(AnalyticsController, AnalyticsController),
    SurveyController: Object.assign(SurveyController, SurveyController),
    MomentMediaController: Object.assign(MomentMediaController, MomentMediaController),
    AnswerController: Object.assign(AnswerController, AnswerController),
    RatingController: Object.assign(RatingController, RatingController),
    NudgeController: Object.assign(NudgeController, NudgeController),
    LetterReplyController: Object.assign(LetterReplyController, LetterReplyController),
    MoodController: Object.assign(MoodController, MoodController),
    PlaceController: Object.assign(PlaceController, PlaceController),
    PromptController: Object.assign(PromptController, PromptController),
    SpaceEventController: Object.assign(SpaceEventController, SpaceEventController),
    MomentController: Object.assign(MomentController, MomentController),
    MomentDateController: Object.assign(MomentDateController, MomentDateController),
    MomentReactionController: Object.assign(MomentReactionController, MomentReactionController),
    MomentCommentController: Object.assign(MomentCommentController, MomentCommentController),
    Admin: Object.assign(Admin, Admin),
    Settings: Object.assign(Settings, Settings),
    OpsController: Object.assign(OpsController, OpsController),
    SeoController: Object.assign(SeoController, SeoController),
}

export default Controllers