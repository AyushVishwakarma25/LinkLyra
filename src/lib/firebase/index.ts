export * from './app';
export * from './auth';
export * from './pages';
export * from './links';
export * from './sections';
export * from './leads';
export * from './analytics';
export * from './billing';
export * from './storage';

import { authService } from './auth';
import { pagesService } from './pages';
import { linksService } from './links';
import { sectionsService } from './sections';
import { leadsService } from './leads';
import { analyticsService } from './analytics';
import { billingService } from './billing';
import { storageService } from './storage';

/**
 * Consolidated profileService providing full backwards-compatible facade
 * over modular Firebase domain services.
 */
export const profileService = {
  // Auth
  onAuthStateChange: authService.onAuthStateChange.bind(authService),
  getCurrentUser: authService.getCurrentUser.bind(authService),
  provisionAccount: authService.provisionAccount.bind(authService),
  signUp: authService.signUp.bind(authService),
  signIn: authService.signIn.bind(authService),
  signInWithGoogle: authService.signInWithGoogle.bind(authService),
  signOut: authService.signOut.bind(authService),
  changePassword: authService.changePassword.bind(authService),
  updateAccountPassword: authService.updateAccountPassword.bind(authService),
  resetPassword: authService.resetPassword.bind(authService),
  sendPasswordReset: authService.sendPasswordReset.bind(authService),
  sendEmailVerificationLink: authService.sendEmailVerificationLink.bind(authService),
  sendVerificationEmail: authService.sendVerificationEmail.bind(authService),
  deleteAccount: authService.deleteAccount.bind(authService),
  deleteUserAccount: authService.deleteUserAccount.bind(authService),

  // Pages & Profiles
  getProfile: pagesService.getProfile.bind(pagesService),
  getProfileByUsername: pagesService.getProfileByUsername.bind(pagesService),
  getProfileByDomain: pagesService.getProfileByDomain.bind(pagesService),
  updateProfile: pagesService.updateProfile.bind(pagesService),
  updateProfileDesign: pagesService.updateProfileDesign.bind(pagesService),
  updateAccountSettings: pagesService.updateAccountSettings.bind(pagesService),
  updateWhiteLabelStatus: pagesService.updateWhiteLabelStatus.bind(pagesService),
  claimCustomDomain: pagesService.claimCustomDomain.bind(pagesService),
  releaseCustomDomain: pagesService.releaseCustomDomain.bind(pagesService),
  checkDomainAvailability: pagesService.checkDomainAvailability.bind(pagesService),

  // Links
  getLinks: linksService.getLinks.bind(linksService),
  addLink: linksService.addLink.bind(linksService),
  updateLink: linksService.updateLink.bind(linksService),
  deleteLink: linksService.deleteLink.bind(linksService),
  reorderLinks: linksService.reorderLinks.bind(linksService),
  toggleLinkActive: linksService.toggleLinkActive.bind(linksService),

  // Sections
  getSections: sectionsService.getSections.bind(sectionsService),
  addSection: sectionsService.addSection.bind(sectionsService),
  updateSection: sectionsService.updateSection.bind(sectionsService),
  deleteSection: sectionsService.deleteSection.bind(sectionsService),
  reorderSections: sectionsService.reorderSections.bind(sectionsService),

  // Leads CRM
  submitLead: leadsService.submitLead.bind(leadsService),
  getLeads: leadsService.getLeads.bind(leadsService),
  updateLeadStatus: leadsService.updateLeadStatus.bind(leadsService),
  deleteLead: leadsService.deleteLead.bind(leadsService),
  exportLeadsAsCsv: leadsService.exportLeadsAsCsv.bind(leadsService),

  // Analytics
  recordView: analyticsService.recordView.bind(analyticsService),
  recordClick: analyticsService.recordClick.bind(analyticsService),
  getAnalyticsSummary: analyticsService.getAnalyticsSummary.bind(analyticsService),
  getSpecializedAnalyticsSummary: analyticsService.getSpecializedAnalyticsSummary.bind(analyticsService),
  getRecentEvents: analyticsService.getRecentEvents.bind(analyticsService),
  resetAnalytics: analyticsService.resetAnalytics.bind(analyticsService),

  // Billing & Credits
  getSubscriptionStatus: billingService.getSubscriptionStatus.bind(billingService),
  getUserSubscription: billingService.getUserSubscription.bind(billingService),
  saveUserSubscription: billingService.saveUserSubscription.bind(billingService),
  getInvoices: billingService.getInvoices.bind(billingService),
  getPaymentInvoices: billingService.getPaymentInvoices.bind(billingService),
  recordPaymentInvoice: billingService.recordPaymentInvoice.bind(billingService),
  getCreditTransactions: billingService.getCreditTransactions.bind(billingService),
  logCreditTransaction: billingService.logCreditTransaction.bind(billingService),
  consumeCredits: billingService.consumeCredits.bind(billingService),
  cancelSubscription: billingService.cancelSubscription.bind(billingService),

  // Storage
  uploadAvatar: storageService.uploadAvatar.bind(storageService),
  uploadMedia: storageService.uploadMedia.bind(storageService),
};

export default profileService;
