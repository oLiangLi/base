

/* auto generate */


export const enum Token {
    YYEOF                                    = 0,
    YYerror                                  = 256,
    YYUNDEF                                  = 257,
    TK_PACKAGE                               = 258,
    TK_SCENARIO                              = 259,
    TK_STATE                                 = 260,
    TK_EVENT                                 = 261,
    TK_GROUP                                 = 262,
    TK_DEFINE                                = 263,
    TK_ACTION                                = 264,
    TK_EXPORT                                = 265,
    TK_IDEN                                  = 266,
    TK_CHAR                                  = 267,
    TK_CCL                                   = 268,
    TK_NUMBER                                = 269,
    TK_EXT                                   = 270,

$MAX_TOKEN_VALUE = 270

}


export const enum Action {
    AC_PACKAGE_DECLARE                       = 4,
    AC_PACKAGE_NAME2                         = 6,
    AC_SCENARIO_NAME                         = 11,
    AC_STATE_1                               = 21,
    AC_STATE_2                               = 22,
    AC_EVENT_1                               = 24,
    AC_EVENT_2                               = 25,
    AC_EXPORT_GROUP_FALSE                    = 26,
    AC_EXPORT_GROUP_TRUE                     = 27,
    AC_STATE_GROUP_NAME                      = 29,
    AC_STATE_GROUP_1                         = 32,
    AC_STATE_GROUP_2                         = 33,
    AC_STATE_GROUP_G1                        = 34,
    AC_STATE_GROUP_G2                        = 35,
    AC_EVENT_GROUP_NAME                      = 37,
    AC_EVENT_GROUP_1                         = 40,
    AC_EVENT_GROUP_2                         = 41,
    AC_EVENT_GROUP_G1                        = 42,
    AC_EVENT_GROUP_G2                        = 43,
    AC_START_STATE_DECLARE                   = 47,
    AC_START_STATE_1                         = 50,
    AC_START_STATE_2                         = 51,
    AC_START_STATE_G1                        = 52,
    AC_START_STATE_G2                        = 53,
    AC_ACTION_DECLARE_0                      = 56,
    AC_ACTION_DECLARE_1                      = 57,
    AC_ACTION_OPT_CODE_NULL                  = 58,
    AC_ACTION_OPT_CODE_START                 = 59,
    AC_DEFINE_EXPR                           = 60,
    AC_REGEXP_RE                             = 61,
    AC_REGEXP_RE_BOL                         = 62,
    AC_RE_SERIES                             = 63,
    AC_RE2_SERIES                            = 64,
    AC_SERIES_SINGLETON                      = 65,
    AC_SERIES2_SINGLETON                     = 66,
    AC_SINGLETON_RE                          = 67,
    AC_SINGLETON_MKCLOS                      = 68,
    AC_SINGLETON_MKPOSCL                     = 69,
    AC_SINGLETON_MKOPT                       = 70,
    AC_SINGLETON_MKREP1                      = 71,
    AC_SINGLETON_MKREP1X                     = 72,
    AC_SINGLETON_MKREP2EX                    = 73,
    AC_SINGLETON_CHAR                        = 74,
    AC_SINGLETON_CCL                         = 75,
    AC_SINGLETON_EXT                         = 76,
    AC_SINGLETON_EMPTY                       = 77,
    AC_SINGLETON_STRING                      = 78,
    AC_SINGLETON_ANYCHR                      = 79,
    AC_STRING_CHAR                           = 80,
    AC_STRING2_CHAR                          = 81,

}

