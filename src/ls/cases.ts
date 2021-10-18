/** @format */

export const helper_ColTypeCASE: string = `
CASE ColumnType
    WHEN 'BF' THEN 'BYTE('            || TRIM(CAST(ColumnLength AS INTEGER)) || ')'
    WHEN 'BV' THEN 'VARBYTE('         || TRIM(CAST(ColumnLength AS INTEGER)) || ')'
    WHEN 'CF' THEN 'CHAR('            || TRIM(CAST(ColumnLength AS INTEGER)) || ')'
    WHEN 'CV' THEN 'VARCHAR('         || TRIM(CAST(ColumnLength AS INTEGER)) || ')'
    WHEN 'D ' THEN 'DECIMAL('         || TRIM(DecimalTotalDigits) || ','
                                      || TRIM(DecimalFractionalDigits) || ')'
    WHEN 'DA' THEN 'DATE'
    WHEN 'F ' THEN 'FLOAT'
    WHEN 'I1' THEN 'BYTEINT'
    WHEN 'I2' THEN 'SMALLINT'
    WHEN 'I8' THEN 'BIGINT'
    WHEN 'I ' THEN 'INTEGER'
    WHEN 'AT' THEN 'TIME('            || TRIM(DecimalFractionalDigits) || ')'
    WHEN 'TS' THEN 'TIMESTAMP('       || TRIM(DecimalFractionalDigits) || ')'
    WHEN 'TZ' THEN 'TIME('            || TRIM(DecimalFractionalDigits) || ')' || ' WITH TIME ZONE'
    WHEN 'SZ' THEN 'TIMESTAMP('       || TRIM(DecimalFractionalDigits) || ')' || ' WITH TIME ZONE'
    WHEN 'YR' THEN 'INTERVAL YEAR('   || TRIM(DecimalTotalDigits) || ')'
    WHEN 'YM' THEN 'INTERVAL YEAR('   || TRIM(DecimalTotalDigits) || ')'      || ' TO MONTH'
    WHEN 'MO' THEN 'INTERVAL MONTH('  || TRIM(DecimalTotalDigits) || ')'
    WHEN 'DY' THEN 'INTERVAL DAY('    || TRIM(DecimalTotalDigits) || ')'
    WHEN 'DH' THEN 'INTERVAL DAY('    || TRIM(DecimalTotalDigits) || ')'      || ' TO HOUR'
    WHEN 'DM' THEN 'INTERVAL DAY('    || TRIM(DecimalTotalDigits) || ')'      || ' TO MINUTE'
    WHEN 'DS' THEN 'INTERVAL DAY('    || TRIM(DecimalTotalDigits) || ')'      || ' TO SECOND('
                                      || TRIM(DecimalFractionalDigits) || ')'
    WHEN 'HR' THEN 'INTERVAL HOUR('   || TRIM(DecimalTotalDigits) || ')'
    WHEN 'HM' THEN 'INTERVAL HOUR('   || TRIM(DecimalTotalDigits) || ')'      || ' TO MINUTE'
    WHEN 'HS' THEN 'INTERVAL HOUR('   || TRIM(DecimalTotalDigits) || ')'      || ' TO SECOND('
                                      || TRIM(DecimalFractionalDigits) || ')'
    WHEN 'MI' THEN 'INTERVAL MINUTE(' || TRIM(DecimalTotalDigits) || ')'
    WHEN 'MS' THEN 'INTERVAL MINUTE(' || TRIM(DecimalTotalDigits) || ')'      || ' TO SECOND('
                                      || TRIM(DecimalFractionalDigits) || ')'
    WHEN 'SC' THEN 'INTERVAL SECOND(' || TRIM(DecimalTotalDigits) || ',' 
                                      || TRIM(DecimalFractionalDigits) || ')'
    WHEN 'BO' THEN 'BLOB('            || TRIM(CAST(ColumnLength AS INTEGER)) || ')'
    WHEN 'CO' THEN 'CLOB('            || TRIM(CAST(ColumnLength AS INTEGER)) || ')'

    WHEN 'PD' THEN 'PERIOD(DATE)'     
    WHEN 'PM' THEN 'PERIOD(TIMESTAMP('|| TRIM(DecimalFractionalDigits) || ')' || ' WITH TIME ZONE'
    WHEN 'PS' THEN 'PERIOD(TIMESTAMP('|| TRIM(DecimalFractionalDigits) || '))'
    WHEN 'PT' THEN 'PERIOD(TIME('     || TRIM(DecimalFractionalDigits) || '))'
    WHEN 'PZ' THEN 'PERIOD(TIME('     || TRIM(DecimalFractionalDigits) || '))' || ' WITH TIME ZONE'
    WHEN 'UT' THEN COALESCE(ColumnUDTName,  '<Unknown> ' || ColumnType)

    WHEN '++' THEN 'TD_ANYTYPE'
    WHEN 'N'  THEN 'NUMBER('          || CASE WHEN DecimalTotalDigits = -128 THEN '*' ELSE TRIM(DecimalTotalDigits) END
                                      || CASE WHEN DecimalFractionalDigits IN (0, -128) THEN '' ELSE ',' || TRIM(DecimalFractionalDigits) END
                                      || ')'
    WHEN 'A1' THEN COALESCE('SYSUDTLIB.' || ColumnUDTName,  '<Unknown> ' || ColumnType)
    WHEN 'AN' THEN COALESCE('SYSUDTLIB.' || ColumnUDTName,  '<Unknown> ' || ColumnType)

    ELSE '<Unknown> ' || ColumnType
  END 
  || CASE
        WHEN ColumnType IN ('CV', 'CF', 'CO') 
        THEN CASE CharType 
                WHEN 1 THEN ' CHARACTER SET LATIN'
                WHEN 2 THEN ' CHARACTER SET UNICODE'
                WHEN 3 THEN ' CHARACTER SET KANJISJIS'
                WHEN 4 THEN ' CHARACTER SET GRAPHIC'
                WHEN 5 THEN ' CHARACTER SET KANJI1'
                ELSE ''
            END
        ELSE ''
  END|| CASE
  WHEN ColumnType IN ('CV', 'CF', 'CO') 
  THEN CASE CharType 
          WHEN 1 THEN ' CHARACTER SET LATIN'
          WHEN 2 THEN ' CHARACTER SET UNICODE'
          WHEN 3 THEN ' CHARACTER SET KANJISJIS'
          WHEN 4 THEN ' CHARACTER SET GRAPHIC'
          WHEN 5 THEN ' CHARACTER SET KANJI1'
          ELSE ''
       END
   ELSE ''
END
  
`;
