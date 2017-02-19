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
                observer.trigger('EXCLUSION', matrix2.model.get_exclude());
            }),

            removeFactor = spa_page_transition.createFunc(function (observer, anchor_map) {
                getLogger().debug('removeFactor is called!', anchor_map);
                observer.trigger('FACTOR', matrix2.model.remove_factor(anchor_map.id));
                observer.trigger('EXCLUSION', matrix2.model.get_exclude());
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
        _exclusion_list, get_exclusion, add_exclusion, remove_exclusion,
        _exclude_list_of_first, init_exclude_list,
        prepare;

    prepare = function (data) {
        _factors = data.factors;
        _input_factor_options = data.input_factor_options;
        _input_factor_options_of_first = data.input_factor_options;
        _exclusion_list = data.exclude_list;
        _exclude_list_of_first = data.exclude_list;
    };

    //factors
    get_factors = function () {
        return {"factors": _factors};
    };
    add_factor = function (name, options) {
        var
            max_id = spa_page_util.isEmpty(_factors) ? 0 : Math.max.apply(null, _factors.map(function (el) {
                return el.id;
            }));
        _factors.push({'id': String(max_id + 1), 'name': name, 'options': options});
        return get_factors();
    };
    remove_factor = function (id) {
        _factors = _factors.filter(function (el) {
            return id !== el.id;
        });
        return get_factors();
    };

    //input-factor-options
    get_input_factor_options = function () {
        return {"input_factor_options": _input_factor_options};
    };
    add_input_factor_option = function () {
        var
            max_id = spa_page_util.isEmpty(_input_factor_options) ? 0 : Math.max.apply(null, _input_factor_options.map(function (el) {
                return el.id;
            })) + 1;
        _input_factor_options.push({'id': String(max_id)});
        return get_input_factor_options();
    };
    remove_input_factor_option = function (id) {
        _input_factor_options = _input_factor_options.filter(function (el) {
            return  id !== 'factor-input-option-remove-' + el.id;
        });
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
    init_exclude_list = function () {
        _exclusion_list = _exclude_list_of_first;
        return get_exclusion();
    };
    add_exclusion = function () {
        var
            max_id = spa_page_util.isEmpty(_exclusion_list) ? 0 : Math.max.apply(null, _exclusion_list.map(function (el) {
                    return el.id;
                })) + 1,
            new_exclusion = jQuery.extend(true, {}, _exclude_list_of_first[0]);

        new_exclusion.id = max_id;
        _exclusion_list.push(new_exclusion);
        return get_exclusion();
    };
    remove_exclusion = function (id) {
        _exclusion_list = _exclusion_list.filter(function (el) {
            return  id !== 'exclusion-remove-' + el.id;
        });
        return get_exclusion();
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
        init_exclude_list: init_exclude_list,
        add_exclusion: add_exclusion,
        remove_exclusion: remove_exclusion,
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