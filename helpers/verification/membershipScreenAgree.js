const { isAgreementEnabled } = require('./isAgreementEnabled');
const { startAgreementProcess } = require('./agreeHelper');

function membershipScreenAgree(member, settings, provider, agreementChannel) {
    // check if agreement is enabled
    const isAgreement = isAgreementEnabled(member.guild, provider);
    // if it's not enabled, stop
    if (!isAgreement) return;
    // if it is, we can start the agreement process
    startAgreementProcess(member.user, member.guild, settings, provider, agreementChannel);
}

exports.membershipScreenAgree = membershipScreenAgree;
