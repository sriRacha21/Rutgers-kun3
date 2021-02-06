function isAgreementEnabled(guild, settings) {
    return (
        settings.get(guild, 'agreementChannel') &&
        settings.get(guild, 'agreementRoles') &&
        settings.get(guild, 'welcomeChannel')
    ) || settings.get(guild, 'agreementSlim');
}

exports.isAgreementEnabled = isAgreementEnabled;
