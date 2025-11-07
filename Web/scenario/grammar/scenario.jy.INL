
/* A Bison parser, made by GNU Bison 3.8.2.  */

/* Skeleton implementation for Bison's Yacc-like parsers in C

   Copyright (C) 1984, 1989, 1990, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2022
   Free Software Foundation, Inc.

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <https://www.gnu.org/licenses/>.  */

/* As a special exception, you may create a larger work that contains
   part or all of the Bison parser skeleton and distribute that work
   under terms of your choice, so long as that work isn't itself a
   parser generator using the skeleton or a modified version thereof
   as a parser skeleton.  Alternatively, if you modify or redistribute
   the parser skeleton itself, you may (at your option) remove this
   special exception, which will cause the skeleton and the resulting
   Bison output files to be licensed under the GNU General Public
   License without this special exception.

   This special exception was added by the Free Software Foundation in
   version 2.2 of Bison.  */

  
/* C XLALR(1) parser skeleton written by liang.li , tables only */

#ifndef _XDPDA_IMPLEMENT_TABLE_STORE
#define _XDPDA_IMPLEMENT_TABLE_STORE(__entry__)		__entry__
#endif /* _XDPDA_IMPLEMENT_TABLE_STORE */

   
/*
 * X1 -- _XDPDA_IMPLEMENT_IDENTIFICATION_DECLARE_ BEGIN ...
 */   
#ifdef _XDPDA_IMPLEMENT_IDENTIFICATION_DECLARE_

/* Identify Bison output, and Bison version.  */
#define YYBISON 30802

/* Bison version string.  */
#define YYBISON_VERSION "3.8.2"

/* Skeleton name.  */
#define YYSKELETON_NAME "Build/tools/script/grammar.yc"


#endif /* _XDPDA_IMPLEMENT_IDENTIFICATION_DECLARE_ */
/*
 * X1 -- _XDPDA_IMPLEMENT_IDENTIFICATION_DECLARE_ END.
 */

/*
 * X1 -- _XDPDA_IMPLEMENT_TOKENENUMS_DECLARE_ BEGIN ...
 */
#ifdef _XDPDA_IMPLEMENT_TOKENENUMS_DECLARE_

/* Token kinds.  */
#ifndef YYTOKENTYPE
# define YYTOKENTYPE
  enum yytokentype
  {
    YYEMPTY = -2,
    YYEOF = 0,                     /* "end of file"  */
    YYerror = 256,                 /* error  */
    YYUNDEF = 257,                 /* "invalid token"  */
    TK_PACKAGE = 258,              /* TK_PACKAGE  */
    TK_SCENARIO = 259,             /* TK_SCENARIO  */
    TK_STATE = 260,                /* TK_STATE  */
    TK_EVENT = 261,                /* TK_EVENT  */
    TK_GROUP = 262,                /* TK_GROUP  */
    TK_DEFINE = 263,               /* TK_DEFINE  */
    TK_ACTION = 264,               /* TK_ACTION  */
    TK_EXPORT = 265,               /* TK_EXPORT  */
    TK_IDEN = 266,                 /* TK_IDEN  */
    TK_CHAR = 267,                 /* TK_CHAR  */
    TK_CCL = 268,                  /* TK_CCL  */
    TK_NUMBER = 269,               /* TK_NUMBER  */
    TK_EXT = 270                   /* TK_EXT  */
  };
  typedef enum yytokentype yytoken_kind_t;
#endif


#endif /*_XDPDA_IMPLEMENT_TOKENENUMS_DECLARE_*/
/* 
 * X1 -- _XDPDA_IMPLEMENT_TOKENENUMS_DECLARE_ END.
 */

/*
 * X2 -- _XDPDA_IMPLEMENT_CONSTANT_DECLARE_ BEGIN ...
 */
 #ifdef _XDPDA_IMPLEMENT_CONSTANT_DECLARE_
 
/* YYFINAL -- State number of the termination state.  */
#define _XDPDACD_YYFINAL  		6
/* YYLAST -- Last index in YYTABLE.  */
#define _XDPDACD_YYLAST   		125

/* YYNTOKENS -- Number of terminals.  */
#define _XDPDACD_YYNTOKENS  	31
/* YYNNTS -- Number of nonterminals.  */
#define _XDPDACD_YYNNTS  		36
/* YYNRULES -- Number of rules.  */
#define _XDPDACD_YYNRULES  		81
/* YYNRULES -- Number of states.  */
#define _XDPDACD_YYNSTATES  	144

#define _XDPDACD_YYUNDEFTOK  	YYUNDEF
#define _XDPDACD_YYMAXUTOK   	270

#define _XDPDACD_YYPACT_NINF 	-72
#define _XDPDACD_YYTABLE_NINF 	-1

#endif /* _XDPDA_IMPLEMENT_CONSTANT_DECLARE_ */
/*
 * X2 -- _XDPDA_IMPLEMENT_CONSTANT_DECLARE_ END.
 */
 
 /*
  * X3 -- _XDPDA_IMPLEMENT_STATE_TYPE_DECLARE_ BEGIN ...
  */
 #ifdef _XDPDA_IMPLEMENT_STATE_TYPE_DECLARE_
 
#define _XDPDAST_yytranslate _XDPDAST_IMPLEMENT_OF( uint8_t )
#define _XDPDAST_yyprhs      _XDPDAST_IMPLEMENT_OF( uint16_t )
#define _XDPDAST_yyrhs       _XDPDAST_IMPLEMENT_OF( int8_t )
#define _XDPDAST_yyrline     _XDPDAST_IMPLEMENT_OF( uint16_t )
#define _XDPDAST_yytoknum    _XDPDAST_IMPLEMENT_OF( uint16_t )
#define _XDPDAST_yyr1        _XDPDAST_IMPLEMENT_OF( uint8_t )
#define _XDPDAST_yyr2        _XDPDAST_IMPLEMENT_OF( uint8_t )
#define _XDPDAST_yydefact    _XDPDAST_IMPLEMENT_OF( uint8_t )
#define _XDPDAST_yydefgoto   _XDPDAST_IMPLEMENT_OF( uint8_t )
#define _XDPDAST_yypact      _XDPDAST_IMPLEMENT_OF( int8_t )
#define _XDPDAST_yypgoto     _XDPDAST_IMPLEMENT_OF( int8_t )
#define _XDPDAST_yytable     _XDPDAST_IMPLEMENT_OF( uint8_t )
#define _XDPDAST_yycheck     _XDPDAST_IMPLEMENT_OF( int8_t )
#define _XDPDAST_yystos      _XDPDAST_IMPLEMENT_OF( uint8_t )

#endif /*_XDPDA_IMPLEMENT_STATE_TYPE_DECLARE_*/
/*
 * X3 -- _XDPDA_IMPLEMENT_STATE_TYPE_DECLARE_ END   ...
 */  
 
/*
 * X4 -- _XDPDA_IMPLEMENT_TNAME_DECLARE_ BEGIN ...
 */
#ifdef _XDPDA_IMPLEMENT_TNAME_DECLARE_
static const char *const 
_XDPDA_IMPLEMENT_TABLE_STORE(_XDPDA_IMPLEMENT_NAME_OF( yytname )[]) =
{
  "\"end of file\"", "error", "\"invalid token\"", "TK_PACKAGE",
  "TK_SCENARIO", "TK_STATE", "TK_EVENT", "TK_GROUP", "TK_DEFINE",
  "TK_ACTION", "TK_EXPORT", "TK_IDEN", "TK_CHAR", "TK_CCL", "TK_NUMBER",
  "TK_EXT", "'.'", "'{'", "'}'", "','", "'<'", "'>'", "'/'", "'^'", "'|'",
  "'('", "')'", "'*'", "'+'", "'?'", "'\"'", "$accept", "goal", "package",
  "package_name", "scenarios", "scenario", "scenario_name",
  "scenario_declare_list", "scenario_declare", "state_declare",
  "state_list", "event_declare", "event_list", "export_group",
  "state_group_declare", "state_group_name", "state_group_entries",
  "state_group_item", "event_group_declare", "event_group_name",
  "event_group_entries", "event_group_item", "action_group_declare",
  "start_state_declare", "start_state_declare_begin", "start_state_list",
  "start_state", "action_declare_list", "action_declare", "opt_code",
  "define_expr", "regexp", "re", "series", "singleton", "string", YY_NULLPTR
};
#endif /* _XDPDA_IMPLEMENT_TNAME_DECLARE_ */
/*
 * X4 -- _XDPDA_IMPLEMENT_TNAME_DECLARE_ END.
 */
 
/*
 * X5 -- _XDPDA_IMPLEMENT_TOKNUM_DECLARE_ BEGIN ...
 */
#ifdef _XDPDA_IMPLEMENT_TOKNUM_DECLARE_
static const 
_XDPDA_IMPLEMENT_STATE_TYPE_OF( uint16_t )
_XDPDA_IMPLEMENT_TABLE_STORE(_XDPDA_IMPLEMENT_NAME_OF( yytoknum )[]) =
{
       0,   256,   257,   258,   259,   260,   261,   262,   263,   264,
     265,   266,   267,   268,   269,   270,    46,   123,   125,    44,
      60,    62,    47,    94,   124,    40,    41,    42,    43,    63,
      34
};
#endif /* _XDPDA_IMPLEMENT_TOKNUM_DECLARE_ */
/*
 * X5 -- _XDPDA_IMPLEMENT_TOKNUM_DECLARE_ END.
 */ 
 
/*
 * X6 -- _XDPDA_IMPLEMENT_DBGTBL_DECLARE_ BEGIN ...
 */
#ifdef _XDPDA_IMPLEMENT_DBGTBL_DECLARE_
static const 
_XDPDA_IMPLEMENT_STATE_TYPE_OF( uint16_t )
_XDPDA_IMPLEMENT_TABLE_STORE(_XDPDA_IMPLEMENT_NAME_OF( yyprhs )[]) =
{
       0,     0,     3,     5,     8,    11,    13,    17,    19,    22,
      28,    33,    35,    37,    40,    42,    44,    46,    48,    50,
      52,    55,    57,    61,    64,    66,    70,    72,    75,    82,
      84,    86,    90,    92,    96,   100,   106,   113,   115,   117,
     121,   123,   127,   131,   137,   142,   146,   151,   152,   154,
     158,   160,   164,   168,   174,   176,   179,   183,   188,   189,
     191,   195,   199,   204,   206,   210,   212,   215,   219,   222,
     225,   228,   233,   239,   246,   248,   250,   252,   255,   259,
     261,   263
};

/* YYRHS -- A `-1'-separated list of the rules' RHS.  */
static const 
_XDPDA_IMPLEMENT_STATE_TYPE_OF( int8_t )
_XDPDA_IMPLEMENT_TABLE_STORE(_XDPDA_IMPLEMENT_NAME_OF( yyrhs )[]) =
{
      32,     0,    -1,    33,    -1,    33,    35,    -1,     3,    34,
      -1,    11,    -1,    34,    16,    11,    -1,    36,    -1,    35,
      36,    -1,     4,    37,    17,    38,    18,    -1,     4,    37,
      17,    18,    -1,    11,    -1,    39,    -1,    38,    39,    -1,
      40,    -1,    42,    -1,    45,    -1,    49,    -1,    53,    -1,
      61,    -1,     5,    41,    -1,    11,    -1,    41,    19,    11,
      -1,     6,    43,    -1,    11,    -1,    43,    19,    11,    -1,
       7,    -1,    10,     7,    -1,    44,     5,    46,    17,    47,
      18,    -1,    11,    -1,    48,    -1,    47,    19,    48,    -1,
      11,    -1,    11,    16,    11,    -1,    17,    11,    18,    -1,
      17,    11,    16,    11,    18,    -1,    44,     6,    50,    17,
      51,    18,    -1,    11,    -1,    52,    -1,    51,    19,    52,
      -1,    11,    -1,    11,    16,    11,    -1,    17,    11,    18,
      -1,    17,    11,    16,    11,    18,    -1,    54,    17,    58,
      18,    -1,    54,    17,    18,    -1,    55,    20,    56,    21,
      -1,    -1,    57,    -1,    56,    19,    57,    -1,    11,    -1,
      11,    16,    11,    -1,    17,    11,    18,    -1,    17,    11,
      16,    11,    18,    -1,    59,    -1,    58,    59,    -1,     9,
      62,    60,    -1,     9,    11,    62,    60,    -1,    -1,    17,
      -1,     8,    11,    62,    -1,    22,    63,    22,    -1,    22,
      23,    63,    22,    -1,    64,    -1,    63,    24,    64,    -1,
      65,    -1,    64,    65,    -1,    25,    63,    26,    -1,    65,
      27,    -1,    65,    28,    -1,    65,    29,    -1,    65,    17,
      14,    18,    -1,    65,    17,    14,    19,    18,    -1,    65,
      17,    14,    19,    14,    18,    -1,    12,    -1,    13,    -1,
      15,    -1,    30,    30,    -1,    30,    66,    30,    -1,    16,
      -1,    12,    -1,    66,    12,    -1
};

/* YYRLINE[YYN] -- source line where rule number YYN was defined.  */
static const 
_XDPDA_IMPLEMENT_STATE_TYPE_OF( uint16_t )
_XDPDA_IMPLEMENT_TABLE_STORE(_XDPDA_IMPLEMENT_NAME_OF( yyrline )[]) =
{
       0,    29,    29,    31,    35,    39,    41,    45,    47,    51,
      55,    59,    63,    65,    69,    71,    73,    75,    77,    79,
      83,    87,    89,    93,    97,    99,   103,   105,   109,   115,
     119,   121,   125,   127,   129,   131,   135,   141,   145,   147,
     151,   153,   155,   157,   161,   165,   169,   173,   177,   179,
     183,   185,   187,   189,   193,   195,   199,   201,   205,   207,
     211,   215,   217,   221,   223,   227,   229,   233,   235,   237,
     239,   241,   243,   245,   247,   249,   251,   253,   255,   257,
     261,   263
};
#endif /* _XDPDA_IMPLEMENT_DBGTBL_DECLARE_ */
/*
 * X6 -- _XDPDA_IMPLEMENT_DBGTBL_DECLARE_ END.
 */
  	 
/*
 * X7 -- _XDPDA_IMPLEMENT_TABLE_DECLARE_ BEGIN ...
 */  	 
#ifdef _XDPDA_IMPLEMENT_TABLE_DECLARE_

/* YYTRANSLATE[YYLEX] -- Bison symbol number corresponding to YYLEX.  */
static const 
_XDPDA_IMPLEMENT_STATE_TYPE_OF( uint8_t )
_XDPDA_IMPLEMENT_TABLE_STORE(_XDPDA_IMPLEMENT_NAME_OF( yytranslate) []) =
{
       0,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,    30,     2,     2,     2,     2,     2,
      25,    26,    27,    28,    19,     2,    16,    22,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
      20,     2,    21,    29,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,    23,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,    17,    24,    18,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     1,     2,     3,     4,
       5,     6,     7,     8,     9,    10,    11,    12,    13,    14,
      15
};	

/* YYR1[YYN] -- Symbol number of symbol that rule YYN derives.  */
static const 
_XDPDA_IMPLEMENT_STATE_TYPE_OF( uint8_t )
_XDPDA_IMPLEMENT_TABLE_STORE(_XDPDA_IMPLEMENT_NAME_OF( yyr1 )[]) =
{
       0,    31,    32,    32,    33,    34,    34,    35,    35,    36,
      36,    37,    38,    38,    39,    39,    39,    39,    39,    39,
      40,    41,    41,    42,    43,    43,    44,    44,    45,    46,
      47,    47,    48,    48,    48,    48,    49,    50,    51,    51,
      52,    52,    52,    52,    53,    53,    54,    55,    56,    56,
      57,    57,    57,    57,    58,    58,    59,    59,    60,    60,
      61,    62,    62,    63,    63,    64,    64,    65,    65,    65,
      65,    65,    65,    65,    65,    65,    65,    65,    65,    65,
      66,    66
};

/* YYR2[YYN] -- Number of symbols composing right hand side of rule YYN.  */
static const 
_XDPDA_IMPLEMENT_STATE_TYPE_OF( uint8_t )
_XDPDA_IMPLEMENT_TABLE_STORE(_XDPDA_IMPLEMENT_NAME_OF( yyr2 )[]) =
{
       0,     2,     1,     2,     2,     1,     3,     1,     2,     5,
       4,     1,     1,     2,     1,     1,     1,     1,     1,     1,
       2,     1,     3,     2,     1,     3,     1,     2,     6,     1,
       1,     3,     1,     3,     3,     5,     6,     1,     1,     3,
       1,     3,     3,     5,     4,     3,     4,     0,     1,     3,
       1,     3,     3,     5,     1,     2,     3,     4,     0,     1,
       3,     3,     4,     1,     3,     1,     2,     3,     2,     2,
       2,     4,     5,     6,     1,     1,     1,     2,     3,     1,
       1,     2
};

/* YYDEFACT[STATE-NAME] -- Default rule to reduce with in state
   STATE-NUM when YYTABLE doesn't specify something else to do.  Zero
   means the default is an error.  */
static const 
_XDPDA_IMPLEMENT_STATE_TYPE_OF( uint8_t )
_XDPDA_IMPLEMENT_TABLE_STORE(_XDPDA_IMPLEMENT_NAME_OF( yydefact )[]) =
{
       0,     0,     0,     2,     5,     4,     1,     0,     3,     7,
       0,    11,     0,     8,     6,    47,     0,     0,    26,     0,
       0,    10,    47,    12,    14,    15,     0,    16,    17,    18,
       0,     0,    19,    21,    20,    24,    23,     0,    27,     9,
      13,     0,     0,     0,     0,     0,     0,     0,    60,    29,
       0,    37,     0,     0,    45,     0,    54,    50,     0,     0,
      48,    22,    25,    74,    75,    76,    79,     0,     0,     0,
       0,    63,    65,     0,     0,     0,    58,    44,    55,     0,
       0,     0,    46,     0,     0,    80,    77,     0,    61,     0,
      66,     0,    68,    69,    70,    32,     0,     0,    30,    40,
       0,     0,    38,    58,    59,    56,    51,     0,    52,    49,
      62,    67,    81,    78,    64,     0,     0,     0,    28,     0,
       0,     0,    36,     0,    57,     0,    71,     0,    33,     0,
      34,    31,    41,     0,    42,    39,    53,     0,    72,     0,
       0,    73,    35,    43
};

/* YYDEFGOTO[NTERM-NUM].  */
static const 
_XDPDA_IMPLEMENT_STATE_TYPE_OF( uint8_t )
_XDPDA_IMPLEMENT_TABLE_STORE(_XDPDA_IMPLEMENT_NAME_OF( yydefgoto )[]) =
{
       0,     2,     3,     5,     8,     9,    12,    22,    23,    24,
      34,    25,    36,    26,    27,    50,    97,    98,    28,    52,
     101,   102,    29,    30,    31,    59,    60,    55,    56,   105,
      32,    48,    70,    71,    72,    87
};

/* YYPACT[STATE-NUM] -- Index in YYTABLE of the portion describing
   STATE-NUM.  */

static const 
_XDPDA_IMPLEMENT_STATE_TYPE_OF( int8_t )
_XDPDA_IMPLEMENT_TABLE_STORE(_XDPDA_IMPLEMENT_NAME_OF( yypact )[]) =
{
      14,    50,    31,    35,   -72,    63,   -72,    69,    35,   -72,
      70,   -72,    65,   -72,   -72,    22,    72,    73,   -72,    74,
      79,   -72,    28,   -72,   -72,   -72,    66,   -72,   -72,   -72,
      71,    67,   -72,   -72,    75,   -72,    76,    68,   -72,   -72,
     -72,    78,    80,     1,     7,    81,    82,   -10,   -72,   -72,
      83,   -72,    84,    30,   -72,    33,   -72,    86,    85,    36,
     -72,   -72,   -72,   -72,   -72,   -72,   -72,    -4,    -4,    -8,
      38,    -4,    20,    39,    42,    68,    87,   -72,   -72,    88,
      -2,     7,   -72,    41,    43,   -72,   -72,    -5,   -72,    -4,
      20,    89,   -72,   -72,   -72,    90,    94,    26,   -72,    91,
      97,    55,   -72,    87,   -72,   -72,   -72,    98,   -72,   -72,
     -72,   -72,   -72,   -72,    -4,    57,    99,    48,   -72,    39,
     100,    52,   -72,    42,   -72,    95,   -72,    40,   -72,   101,
     -72,   -72,   -72,   103,   -72,   -72,   -72,   102,   -72,   104,
     105,   -72,   -72,   -72
};

/* YYPGOTO[NTERM-NUM].  */
static const 
_XDPDA_IMPLEMENT_STATE_TYPE_OF( int8_t )
_XDPDA_IMPLEMENT_TABLE_STORE(_XDPDA_IMPLEMENT_NAME_OF( yypgoto )[]) =
{
     -72,   -72,   -72,   -72,   -72,   107,   -72,   -72,    96,   -72,
     -72,   -72,   -72,   -72,   -72,   -72,   -72,   -22,   -72,   -72,
     -72,   -25,   -72,   -72,   -72,   -72,    44,   -72,    61,    16,
     -72,   -52,    10,    32,   -71,   -72
};

/* YYTABLE[YYPACT[STATE-NUM]].  What to do in state STATE-NUM.  If
   positive, shift that token.  If negative, reduce the rule which
   number is the opposite.  If zero, do what YYDEFACT says.
   If YYTABLE_NINF, syntax error.  */

static const 
_XDPDA_IMPLEMENT_STATE_TYPE_OF( uint8_t )
_XDPDA_IMPLEMENT_TABLE_STORE(_XDPDA_IMPLEMENT_NAME_OF( yytable )[]) =
{
      90,    76,    63,    64,    85,    65,    66,   112,    63,    64,
      53,    65,    66,    67,   107,    68,   108,     1,    57,    54,
      69,    68,    86,   103,    58,   113,    69,    16,    17,    18,
      19,     6,    20,    16,    17,    18,    19,    91,    20,     7,
      21,    75,    53,    90,   118,   119,    39,    92,    93,    94,
      95,    77,    47,    99,   137,    81,    96,    82,   138,   100,
      88,     4,    89,   110,   129,    89,   130,    89,   133,   111,
     134,    41,    42,   122,   123,   126,   127,    83,    84,    10,
      11,    14,    15,    33,    35,    37,    38,    44,    43,    49,
      47,    51,    61,    62,    45,    46,    80,   131,   135,   106,
      73,    74,    79,   115,   104,   117,   116,   120,   121,   125,
     128,   132,   139,   136,   140,    13,    78,     0,    40,   124,
     141,   114,   142,   143,     0,   109
};

static const 
_XDPDA_IMPLEMENT_STATE_TYPE_OF( int8_t )
_XDPDA_IMPLEMENT_TABLE_STORE(_XDPDA_IMPLEMENT_NAME_OF( yycheck )[]) =
{
      71,    53,    12,    13,    12,    15,    16,    12,    12,    13,
       9,    15,    16,    23,    16,    25,    18,     3,    11,    18,
      30,    25,    30,    75,    17,    30,    30,     5,     6,     7,
       8,     0,    10,     5,     6,     7,     8,    17,    10,     4,
      18,    11,     9,   114,    18,    19,    18,    27,    28,    29,
      11,    18,    22,    11,    14,    19,    17,    21,    18,    17,
      22,    11,    24,    22,    16,    24,    18,    24,    16,    26,
      18,     5,     6,    18,    19,    18,    19,    67,    68,    16,
      11,    11,    17,    11,    11,    11,     7,    20,    17,    11,
      22,    11,    11,    11,    19,    19,    11,   119,   123,    11,
      17,    17,    16,    14,    17,    11,    16,    16,    11,    11,
      11,    11,    11,    18,    11,     8,    55,    -1,    22,   103,
      18,    89,    18,    18,    -1,    81
};

#if 0
/* YYSTOS[STATE-NUM] -- The (internal number of the) accessing
   symbol of state STATE-NUM.  */
static const 
_XDPDA_IMPLEMENT_STATE_TYPE_OF( uint8_t )
_XDPDA_IMPLEMENT_TABLE_STORE(_XDPDA_IMPLEMENT_NAME_OF( yystos )[]) =
{
       0,     3,    32,    33,    11,    34,     0,     4,    35,    36,
      16,    11,    37,    36,    11,    17,     5,     6,     7,     8,
      10,    18,    38,    39,    40,    42,    44,    45,    49,    53,
      54,    55,    61,    11,    41,    11,    43,    11,     7,    18,
      39,     5,     6,    17,    20,    19,    19,    22,    62,    11,
      46,    11,    50,     9,    18,    58,    59,    11,    17,    56,
      57,    11,    11,    12,    13,    15,    16,    23,    25,    30,
      63,    64,    65,    17,    17,    11,    62,    18,    59,    16,
      11,    19,    21,    63,    63,    12,    30,    66,    22,    24,
      65,    17,    27,    28,    29,    11,    17,    47,    48,    11,
      17,    51,    52,    62,    17,    60,    11,    16,    18,    57,
      22,    26,    12,    30,    64,    14,    16,    11,    18,    19,
      16,    11,    18,    19,    60,    11,    18,    19,    11,    16,
      18,    48,    11,    16,    18,    52,    18,    14,    18,    11,
      11,    18,    18,    18
};
#endif

#endif /* _XDPDA_IMPLEMENT_TABLE_DECLARE_ */
/*
 * X7 -- _XDPDA_IMPLEMENT_TABLE_DECLARE_ END.
 */   

/**
 *!
 */
#undef _XDPDA_IMPLEMENT_TABLE_STORE


    
/*
 *! XZ1 -- _XDPDA_IMPLEMENT_USER_ACTIONLIST_DECLARE_  BEGIN ...
 */
#ifdef _XDPDA_IMPLEMENT_USER_ACTIONLIST_DECLARE_  
enum {
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
};

#endif /* _XDPDA_IMPLEMENT_USER_ACTIONLIST_DECLARE_ */
/*
 *!  XZ1 -- _XDPDA_IMPLEMENT_USER_ACTIONLIST_DECLARE_  END.
 */ 
