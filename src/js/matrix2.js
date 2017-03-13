var matrix2 = (function () {
    'use strict';
    var
        logger, getLogger, initModule;

    getLogger = function () {
        return logger;
    };

    initModule = function ($container, is_debug_mode) {
        var
            server_host = '.',

            PATH_INIT = server_host + '/server_response_initialize.json',

            addFactor = spa_page_transition.createFunc(function (observer, anchor_map) {
                observer.trigger('FACTOR',
                    matrix2.model.add_factor(matrix2.shell.get_factor_name(), matrix2.shell.get_factor_options()));
                observer.trigger('FACTOR_OPTION', matrix2.model.init_input_factor_options());
            }),

            removeFactor = spa_page_transition.createFunc(function (observer, anchor_map) {
                getLogger().debug('removeFactor is called!', anchor_map);
                observer.trigger('FACTOR', matrix2.model.remove_factor(anchor_map.id));
            }),

            addFactorOption = spa_page_transition.createFunc(function (observer, anchor_map) {
                getLogger().debug('addFactorOption is called!', anchor_map);
                observer.trigger('FACTOR_OPTION', matrix2.model.add_input_factor_option());
            }),

            removeFactorOption = spa_page_transition.createFunc(function (observer, anchor_map) {
                getLogger().debug('removeFactorOption is called!', anchor_map);
                observer.trigger('FACTOR_OPTION', matrix2.model.remove_input_factor_option(anchor_map.id));
            }),

            addExclusion = spa_page_transition.createFunc(function (observer, anchor_map) {
                getLogger().debug('addExclusion is called!', anchor_map);
                observer.trigger('EXCLUSION', matrix2.model.add_exclusion());
            }),

            removeExclusion = spa_page_transition.createFunc(function (observer, anchor_map) {
                getLogger().debug('removeExclusion is called!', anchor_map);
                observer.trigger('EXCLUSION', matrix2.model.remove_exclusion(anchor_map.id));
            }),

            addExclusionPair = spa_page_transition.createFunc(function (observer, anchor_map) {
                getLogger().debug('addExclusionPair is called!', anchor_map);
                observer.trigger('EXCLUSION', matrix2.model.add_exclusion_pair(anchor_map.id));
            }),

            removeExclusionPair = spa_page_transition.createFunc(function (observer, anchor_map) {
                getLogger().debug('removeExclusionPair is called!', anchor_map);
                observer.trigger('EXCLUSION', matrix2.model.remove_exclusion_pair(anchor_map.id));
            }),

            selectExclusionPair = spa_page_transition.createFunc(function (observer, anchor_map) {
                // getLogger().debug('selectExclusionPair is called!', anchor_map);
                // observer.trigger('EXCLUSION', matrix2.model.select_exclusion_pair(anchor_map.val));
            }),

            initializationFunc = spa_page_transition.createAjaxFunc(PATH_INIT, null, function (observer, anchor_map, data) {
                // getLogger().debug('initial data loaded!');
                matrix2.model.prepare(data);
                observer.trigger('FACTOR', matrix2.model.get_factors());
                observer.trigger('FACTOR_OPTION', matrix2.model.get_input_factor_options());
                observer.trigger('EXCLUSION', matrix2.model.get_exclude());
            });


        logger = spa_log.createLogger(is_debug_mode, '### MATRIX2.LOG ###');

        matrix2.shell.initModule($container);

        spa_page_transition.debugMode(is_debug_mode).initialize(initializationFunc)
            .addAction(spa_page_transition.model.START_ACTION, 'main')
            .addAction('add-factor', 'main', [addFactor])
            .addAction('remove-factor', 'main', [removeFactor])
            .addAction('add-factor-option', 'main', [addFactorOption])
            .addAction('remove-factor-option', 'main', [removeFactorOption])
            .addAction('add-exclusion', 'main', [addExclusion])
            .addAction('remove-exclusion', 'main', [removeExclusion])
            .addAction('add-exclusion-pair', 'main', [addExclusionPair])
            .addAction('remove-exclusion-pair', 'main', [removeExclusionPair])
            // .addAction('select-exclusion-pair', 'main', [selectExclusionPair])
            .run();
    };

    return {
        initModule: initModule,
        getLogger: getLogger
    }
})();

matrix2.model = (function () {
    var
        _factors, get_factors, add_factor, remove_factor,
        _input_factor_options, get_input_factor_options, add_input_factor_option, remove_input_factor_option,
        _input_factor_options_of_first, init_input_factor_options,
        _exclusion_list, get_exclusion, add_exclusion, remove_exclusion, add_exclusion_pair, remove_exclusion_pair,
        select_exclusion_pair,
        _exclusion_list_of_first, init_exclusion_list,
        _get_str_max_id, _filter_list_by_id, _find_element_by_id, _extract_id_set,
        prepare;

    prepare = function (data) {
        _factors = data.factors;
        _input_factor_options = data.input_factor_options;
        _input_factor_options_of_first = data.input_factor_options;
        _exclusion_list = data.exclude_list;
        _exclusion_list_of_first = data.exclude_list;
    };

    //factors
    get_factors = function () {
        return {"factors": _factors};
    };
    add_factor = function (name, options) {
        _factors.push({'id': _get_str_max_id(_factors), 'name': name, 'options': options});
        return get_factors();
    };
    remove_factor = function (selected_id) {
        _factors = _filter_list_by_id(_factors, selected_id, '');
        return get_factors();
    };

    //input-factor-options
    get_input_factor_options = function () {
        return {"input_factor_options": _input_factor_options};
    };
    add_input_factor_option = function () {
        _input_factor_options.push({'id': _get_str_max_id(_input_factor_options)});
        return get_input_factor_options();
    };
    remove_input_factor_option = function (selected_id) {
        _input_factor_options = _filter_list_by_id(_input_factor_options, selected_id, 'remove-factor-option-id-');
        return get_input_factor_options();
    };
    init_input_factor_options = function () {
        _input_factor_options = _input_factor_options_of_first;
        return get_input_factor_options();
    };

    //exclude-list
    get_exclusion = function () {
        return {'exclude_list': _exclusion_list};
    };
    init_exclusion_list = function () {
        _exclusion_list = _exclusion_list_of_first;
        return get_exclusion();
    };
    add_exclusion = function () {
        var new_exclusion = jQuery.extend(true, {}, _exclusion_list_of_first[0]);
        new_exclusion.id = _get_str_max_id(_exclusion_list);
        _exclusion_list.push(new_exclusion);
        return get_exclusion();
    };
    remove_exclusion = function (selected_id) {
        _exclusion_list = _filter_list_by_id(_exclusion_list, selected_id, 'remove-exclusion-id-');
        return get_exclusion();
    };
    add_exclusion_pair = function (selected_id) {
        var
            selected_exclusion = _find_element_by_id(_exclusion_list, selected_id, 'add-exclusion-pair-id-');
        if (!selected_exclusion) {
            matrix2.getLogger().warn('selected_exclusion is not found. selected_id', selected_id);
            return get_exclusion();
        }
        selected_exclusion.pairs.push({'id': _get_str_max_id(selected_exclusion.pairs), 'selected_factor': {}});
        return get_exclusion();
    };
    remove_exclusion_pair = function (selected_id) {
        var
            exclusion_id,
            exclusion_pair_id,
            selected_exclusion,
            ids = _extract_id_set(selected_id, 'remove-exclusion-pair-id-');
        if (!ids || ids.length !== 2) {
            return get_exclusion();
        }
        exclusion_id = ids[0];
        selected_exclusion = _find_element_by_id(_exclusion_list, exclusion_id, '');
        if (!selected_exclusion) {
            matrix2.getLogger().warn('selected_exclusion is not found. exclusion_id', exclusion_id);
            return get_exclusion();
        }
        exclusion_pair_id = ids[1];
        selected_exclusion.pairs = _filter_list_by_id(selected_exclusion.pairs, exclusion_pair_id, '');
        return get_exclusion();
    };
    select_exclusion_pair = function (selected_val) {
        var
            exclusion_id,
            exclusion_pair_id,
            factor_option_val,
            selected_exclusion,
            selected_exclusion_pair,
            selected_factor,
            ids = _extract_id_set(selected_val, '');
        if (!ids || ids.length !== 3) {
            return get_exclusion();
        }
        exclusion_id = ids[0];
        selected_exclusion = _find_element_by_id(_exclusion_list, exclusion_id, '');
        if (!selected_exclusion) {
            matrix2.getLogger().warn('selected_exclusion is not found. exclusion_id', exclusion_id);
            return get_exclusion();
        }
        exclusion_pair_id = ids[1];
        selected_exclusion_pair = _find_element_by_id(selected_exclusion.pairs, exclusion_pair_id, '');
        if (!selected_exclusion_pair) {
            matrix2.getLogger().warn('selected_exclusion_pair is not found. exclusion_pair_id', exclusion_pair_id);
            return get_exclusion();
        }
        factor_option_val = ids[2];
        selected_factor = _find_element_by_id(_factors, factor_option_val, '');
        if (!selected_factor) {
            matrix2.getLogger().warn('selected_factor is not found. factor_option_val', factor_option_val);
            return get_exclusion();
        }
        selected_exclusion_pair.selected_factor = selected_factor;
        selected_exclusion_pair.selected = true;
        return get_exclusion();
    };

    //util
    _get_str_max_id = function (list) {
        var max_id = spa_page_util.isEmpty(list) ? 0 : Math.max.apply(null, list.map(function (el) {
                return el.id;
            })) + 1;
        return String(max_id);
    };
    _filter_list_by_id = function (list, selected_id, prefix_of_id) {
        return list.filter(function (el) {
            return selected_id !== prefix_of_id + el.id;
        });
    };
    _find_element_by_id = function (list, selected_id, prefix_of_id) {
        return list.filter(function (el) {
            return selected_id === prefix_of_id + el.id;
        })[0] || null;
    };
    _extract_id_set = function (selected_id, prefix_of_id) {
        var ids = selected_id.substr(prefix_of_id.length).split('-');
        // var ids = prefix_of_id ? selected_id.substr(prefix_of_id.length).split('-') : selected_id.split('-');
        if (!ids || ids.length < 2) {
            matrix2.getLogger().warn('id is incorrect. selected_id', selected_id);
        }
        return ids;
    };

    return {
        prepare: prepare,
        get_factors: get_factors,
        add_factor: add_factor,
        remove_factor: remove_factor,
        get_input_factor_options: get_input_factor_options,
        add_input_factor_option: add_input_factor_option,
        remove_input_factor_option: remove_input_factor_option,
        init_input_factor_options: init_input_factor_options,
        get_exclude: get_exclusion,
        init_exclude_list: init_exclusion_list,
        add_exclusion: add_exclusion,
        remove_exclusion: remove_exclusion,
        add_exclusion_pair: add_exclusion_pair,
        remove_exclusion_pair: remove_exclusion_pair,
        select_exclusion_pair: select_exclusion_pair,
    }

})();

matrix2.shell = (function () {
    var
        $container,
        initModule,
        get_factor_name, get_factor_options;

    initModule = function (_$container) {
        $container = _$container;
    };
    get_factor_name = function () {
        return $container.find('#factor-name').val();
    };
    get_factor_options = function () {
        var res = [];
        $container.find('.input_factor_option').each(function (idx, el) {
            var val = $(el).val();
            if (val) {
                res.push({'name': val});
            }
        });
        return res;
    };
    return {
        initModule: initModule,
        get_factor_name: get_factor_name,
        get_factor_options: get_factor_options,
    }

})();