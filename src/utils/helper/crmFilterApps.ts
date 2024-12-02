import { APIService } from "../../utils/api.service";
import { CommonConstants } from "../../utils/common-constants";

export const crmFilterApps = async (refNum: string, userRoles?: any) => {
    try {
        (window as any).showEvents = false;
        (window as any).showCandidates = false;
        (window as any).showLists = false;
        (window as any).showCampaigns = false;
        (window as any).showTemplates = false;
        (window as any).showTalentCommunities = false;
        (window as any).showAutomations = false;
        (window as any).showEvents = false;
        console.log(userRoles);
        const recruiterUserId = (window as any).keycloakInstance.userInfo.userDetails.id;
        const applicationName = CommonConstants.APPLICATION_NAME;
        const paramObj = {
            refNum,
            recruiterUserId
        };
        const { code, type } = (window as any).orgInfo;

        await APIService.registerToken(refNum, code, type);
        const tenantConfigResp = await APIService.getTenantConfig(paramObj);
        const isEventEnabledTC = tenantConfigResp.modules.activate.events;
        const hideCandidatesTab = tenantConfigResp.modules.agencies?.hideCandidatesTab ?? false;
        const isTenantHasJTCEnabled = tenantConfigResp.modules.access.jtc;
        const isTenantHasAutomationFeatureEnabled = tenantConfigResp.modules.feature.automation;
        const isEventsEnabled = tenantConfigResp.modules.activate.events
        // console.log("Getting tenant config is successful. isEventEnabledTC:", isEventEnabledTC);

        const params = {
            loginId: recruiterUserId,
            applicationName,
            tenantId: refNum
        };
        const recruiterPermissionsResp = await APIService.getRecruiterPermissions(params);
        let roleConfig = recruiterPermissionsResp.data[0].permissions;
        const isEventEnabledRP =roleConfig.modules.events.view;
        const isRecruiterHaveCandidatesViewAccess = roleConfig.modules.candidates.view;
        const isListsEnabledRP =roleConfig.modules.list.view;
        const isCampaignViewCampaignAccess =roleConfig.modules.campaigns.view;
        const isCampaignViewTemplateAccess =roleConfig.modules.template.view;
        const hasJTCTabViewAccess = roleConfig.modules.jtc.view;
        const isRecruiterHaveAutomationSettingAccess = roleConfig?.modules?.automation?.view;
        const isRecruiterHaveViewEventsAccess = roleConfig.modules.events.view;

        const isJTCTabEnabled = roleConfig.modules.candidates.view && isTenantHasJTCEnabled && hasJTCTabViewAccess;

        // console.log("Getting recruiter permissions is successful. isEventEnabledRP:", isEventEnabledRP);

        (window as any).showEvents = isEventEnabledTC && isEventEnabledRP;
        (window as any).showCandidates = isRecruiterHaveCandidatesViewAccess && !hideCandidatesTab;
        (window as any).showLists = isListsEnabledRP;
        (window as any).showCampaigns = isCampaignViewCampaignAccess;
        (window as any).showTemplates = isCampaignViewTemplateAccess;
        (window as any).showTalentCommunities = isJTCTabEnabled;
        (window as any).showAutomations = isTenantHasAutomationFeatureEnabled && isRecruiterHaveAutomationSettingAccess;
        (window as any).showEvents = isEventsEnabled && isRecruiterHaveViewEventsAccess;


    } catch (error) {
        console.error("Error in crmFilterApps:", error);
    }
};