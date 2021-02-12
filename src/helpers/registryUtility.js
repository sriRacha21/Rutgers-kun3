function getCommandByName(registry, name) {
    const command = registry.commands
        .filter(command => command.name === name)
        .first();

    return command;
}

exports.getCommandByName = getCommandByName;
