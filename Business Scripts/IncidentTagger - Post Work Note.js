(function executeRule(current, previous /*null when async*/) {

    var tagger = new x_2064375_incide_0.IncidentTagger();
    var result = tagger.classify(current.short_description.toString());

    if (!result.matched) {
        return;
    }

    var workNote = [];
    workNote.push('[Incident Intelligence] Auto-Classification Applied');
    workNote.push('');
    workNote.push('Automatically categorized based on keyword analysis.');
    workNote.push('');
    workNote.push('Classification Details:');
    workNote.push('  Category         : ' + result.category);
    workNote.push('  Subcategory      : ' + result.subcategory);
    workNote.push('  Assignment Group : ' + result.assignment_group);
    workNote.push('  Confidence       : ' + result.confidence);
    workNote.push('  Matched Keywords : ' + result.matched_keywords);
    workNote.push('');
    workNote.push('If incorrect, update Category and Assignment Group manually.');

    var incGR = new GlideRecord('incident');
    if (incGR.get(current.sys_id)) {
        incGR.work_notes = workNote.join('\n');
        incGR.update();
    }

    gs.info('IncidentTagger: Work note posted on ' + current.number);

})(current, previous);