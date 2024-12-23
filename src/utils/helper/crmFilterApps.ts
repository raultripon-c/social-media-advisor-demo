import { APIService } from "../../utils/api.service";
import { CommonConstants } from "../../utils/common-constants";

export const crmFilterApps = async (refNum: string, userRoles?: any) => {
    try {
        (window as any).isCRMFilterAPICompleted = false;
        (window as any).showEvents = false;
        (window as any).showCandidates = false;
        (window as any).showLists = false;
        (window as any).showCampaigns = false;
        (window as any).showTemplates = false;
        (window as any).showTalentCommunities = false;
        (window as any).showAutomations = false;
        (window as any).showEvents = false;
        console.log(userRoles);

        const keycloakInstance = (window as any).keycloakInstance;
        if (!keycloakInstance || !keycloakInstance.userInfo || !keycloakInstance.userInfo.userDetails) {
            throw new Error("Keycloak instance or user details are missing");
        }
        const recruiterUserId = keycloakInstance.userInfo.userDetails.id;
        const applicationName = CommonConstants.APPLICATION_NAME;
        const paramObj = {
            refNum,
            recruiterUserId
        };

        const orgInfo = (window as any).orgInfo;
        if (!orgInfo) {
            throw new Error("Organization info is missing");
        }
        const { code, type } = orgInfo;

        await APIService.registerToken(refNum, code, type);
        APIService.getTenantConfig(paramObj).then(resp => {
            const tenantConfigResp = resp;
            if (!tenantConfigResp || !tenantConfigResp.modules) {
                throw new Error("Tenant config response or modules are missing");
            }
            const isEventEnabledTC = tenantConfigResp.modules.activate?.events;
            const hideCandidatesTab = tenantConfigResp.modules.agencies?.hideCandidatesTab ?? false;
            const isTenantHasJTCEnabled = tenantConfigResp.modules.access?.jtc;
            const isTenantHasAutomationFeatureEnabled = tenantConfigResp.modules.feature?.automation;
            const isEventsEnabled = tenantConfigResp.modules.activate?.events;
            const params = {
                loginId: recruiterUserId,
                applicationName,
                tenantId: refNum
            };
            APIService.getRecruiterPermissions(params).then(permissions => {
                const recruiterPermissionsResp = permissions;
                if (!recruiterPermissionsResp || !recruiterPermissionsResp.data || !recruiterPermissionsResp.data[0]) {
                    throw new Error("Recruiter permissions response or data are missing");
                }
                let roleConfig = recruiterPermissionsResp.data[0].permissions;
                if (!roleConfig || !roleConfig.modules) {
                    throw new Error("Role config or modules are missing");
                }
                const isEventEnabledRP = roleConfig.modules.events?.view;
                const isRecruiterHaveCandidatesViewAccess = roleConfig.modules.candidates?.view;
                const isListsEnabledRP = roleConfig.modules.list?.view;
                const isCampaignViewCampaignAccess = roleConfig.modules.campaigns?.view;
                const isCampaignViewTemplateAccess = roleConfig.modules.template?.view;
                const hasJTCTabViewAccess = roleConfig.modules.jtc?.view;
                const isRecruiterHaveAutomationSettingAccess = roleConfig.modules.automation?.view;
                const isRecruiterHaveViewEventsAccess = roleConfig.modules.events?.view;

                const isJTCTabEnabled = roleConfig.modules.candidates?.view && isTenantHasJTCEnabled && hasJTCTabViewAccess;

                (window as any).showEvents = isEventEnabledTC && isEventEnabledRP;
                (window as any).showCandidates = isRecruiterHaveCandidatesViewAccess && !hideCandidatesTab;
                (window as any).showLists = isListsEnabledRP;
                (window as any).showCampaigns = isCampaignViewCampaignAccess;
                (window as any).showTemplates = isCampaignViewTemplateAccess;
                (window as any).showTalentCommunities = isJTCTabEnabled;
                (window as any).showAutomations = isTenantHasAutomationFeatureEnabled && isRecruiterHaveAutomationSettingAccess;
                (window as any).showEvents = isEventsEnabled && isRecruiterHaveViewEventsAccess;
                (window as any).isCRMFilterAPICompleted = true;
            })
        })

    } catch (error) {
        console.error("Error in crmFilterApps:", error);
    }
};