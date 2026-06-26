(function executeRule(current, previous /*null when async*/) {

    var defaultCategories = ['inquiry',  ''];
    var currentCategory = current.category.toString().toLowerCase();
    
    var userSetCategory = (currentCategory !== '' && 
                           defaultCategories.indexOf(currentCategory) === -1);
    
    if (userSetCategory) {
        gs.info('IncidentTagger: User set category manually, skipping.');
        return;
    }

    var tagger = new x_2064375_incide_0.IncidentTagger();
    var result = tagger.classify(current.short_description.toString());

    if (!result.matched) {
        gs.info('IncidentTagger: No classification match. Description: ' + 
                current.short_description);
        return;
    }

    current.category = result.category;
    current.subcategory = result.subcategory;

    var groupGR = new GlideRecord('sys_user_group');
    groupGR.addQuery('name', result.assignment_group);
    groupGR.setLimit(1);
    groupGR.query();

    if (groupGR.next()) {
        current.assignment_group = groupGR.sys_id;
    } else {
        gs.warn('IncidentTagger: Assignment group not found: ' + result.assignment_group);
    }

    gs.info('IncidentTagger: Classified as ' + result.category + '/' + 
            result.subcategory + ' | Group: ' + result.assignment_group);

})(current, previous);