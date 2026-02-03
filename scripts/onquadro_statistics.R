  # LOAD LIBRARIES
  library(plotly)
  library(ggplot2)
  library(RPostgres)
  library(DBI)
  setwd('/home/paulina/app/wwwroot/onquadro_plots/')
  add_global_shim.function <- function(widget) {
    shim_file <- "plotly-global-shim.js"
    if (!file.exists(shim_file)) {
      writeLines("var GLOBAL = window;", shim_file)
    }
    shim_dependency <- htmltools::htmlDependency(
      name = "plotly-global-shim",
      version = "1.0.0",
      src = ".",
      script = shim_file
    )
    htmltools::attachDependencies(widget, shim_dependency, append = FALSE)
  }
  save_plot_widget.function <- function(widget, file) {
    widget <- add_global_shim.function(widget)
    htmlwidgets::saveWidget(widget, file = file)
  }
  # FUNCTION FOR DATA PREPARATION
  prepere_data_for_plot.function <- function(table) {
    
    # DELETE TOTAL COLUMN
    table <- table[1:ncol(table)-1]
    
    # LABEL
    table_columns = colnames(table[2:ncol(table)])
    labels <- rep(c(table[,1][1:nrow(table)-1]),times=ncol(table)-1) 
    labels <- c(table_columns, labels)
    
    # ID
    ids <- c()
    ids = c(colnames(table[2:ncol(table)]))
    
    for(i in 2:ncol(table))
    {
      ids <- append(ids, c(paste(table[,1][1:nrow(table)-1],colnames(table[i]),sep="_")))
    }
    
    # PARENTS
    parents <- rep(c(""), times=3)
    for (i in 1:ncol(table)-1) {
      parents <- append(parents, rep(c(table_columns[i]), times=nrow(table)-1))
    }
    
    #VALUES
    values <- c()
    for(i in 2:ncol(table)){
      values <-append(values, c(table[nrow(table),i]))
    }
    
    for (i in 2:ncol(table)) {
      values <- append(values, c(table[,i][1:nrow(table)-1]))
    }
    
    # REMOVE VALUES = 0
    zeros_index <-  which(0 == values)
    cleaned_values <- values[values != 0]
    cleaned_ids <- ids
    cleaned_labels <- labels
    cleaned_parents <- parents
    for(i in zeros_index){
      cleaned_ids[i] = 0
      cleaned_labels[i] = 0
      cleaned_parents[i] = 0
    }
    cleaned_ids <- cleaned_ids[cleaned_ids != 0]
    cleaned_labels <- cleaned_labels[cleaned_labels != 0]
    cleaned_parents <- cleaned_parents[cleaned_parents != 0]
    
    # DATA FOR PLOT
    plot_data <- data.frame(cleaned_ids, cleaned_labels, cleaned_parents, cleaned_values, stringsAsFactors = FALSE)
    
    return(plot_data)
  }
  
  # DATABASE CONNECTION
  db <- ''  
  host_db <- ''  
  db_port <- ''
  db_user <- ''
  db_password <- ''
  con <- dbConnect(RPostgres::Postgres(), dbname = db, host=host_db, port=db_port, user=db_user, password=db_password) 
  
  # ALL QUERIES 
  Query_number_of_tetrads_by_sequence_and_molecule_type <- 
    "SELECT sequence,
      SUM(CASE tv.molecule WHEN 'DNA' THEN 1 ELSE 0 END) AS DNA,
      SUM(CASE tv.molecule WHEN 'RNA' THEN 1 ELSE 0 END) AS RNA,
      SUM(CASE tv.molecule WHEN 'Other' THEN 1 ELSE 0 END) AS Other,
      COUNT(*) AS Total
      FROM tetrad_view tv
      JOIN quadruplex_view qv on tv.quadruplex_id = qv.id
      WHERE qv.count > 1
      GROUP BY sequence
      UNION ALL
      SELECT 'Total',
      SUM(CASE tv.molecule WHEN 'DNA' THEN 1 ELSE 0 END) AS DNA,
      SUM(CASE tv.molecule WHEN 'RNA' THEN 1 ELSE 0 END) AS RNA,
      SUM(CASE tv.molecule WHEN 'Other' THEN 1 ELSE 0 END) AS Other,
      COUNT(*) AS Total
      FROM tetrad_view tv
      JOIN quadruplex_view qv on tv.quadruplex_id = qv.id
      WHERE qv.count > 1;"
  
  Query_number_of_quadruplexes_composed_of_2_12_tetrads <- 
    "SELECT CAST(count AS text) AS NumberOfTetrads,
      SUM(CASE molecule WHEN 'DNA' THEN 1 ELSE 0 END) AS DNA,
      SUM(CASE molecule WHEN 'RNA' THEN 1 ELSE 0 END) AS RNA,
      SUM(CASE molecule WHEN 'Other' THEN 1 ELSE 0 END) AS Other,
      COUNT(*) AS Total
      FROM quadruplex_view
      GROUP BY count
      UNION ALL
      SELECT 'Total',
      SUM(CASE molecule WHEN 'DNA' THEN 1 ELSE 0 END) AS DNA,
      SUM(CASE molecule WHEN 'RNA' THEN 1 ELSE 0 END) AS RNA,
      SUM(CASE molecule WHEN 'Other' THEN 1 ELSE 0 END) AS Other,
      COUNT(*) AS Total
      FROM quadruplex_view;"
  
  Query_number_of_uni_bi_and_tetramolecular_quadruplexes <- 
    "SELECT CAST(chains AS text),
  		SUM(CASE molecule WHEN 'DNA' THEN 1 ELSE 0 END) AS DNA,
  		SUM(CASE molecule WHEN 'RNA' THEN 1 ELSE 0 END) AS RNA,
  		SUM(CASE molecule WHEN 'Other' THEN 1 ELSE 0 END) AS Other,
  		COUNT(*) AS Total
  		FROM quadruplex_view
  		GROUP BY chains
  		UNION ALL
  		SELECT 'Total',
  		SUM(CASE molecule WHEN 'DNA' THEN 1 ELSE 0 END) AS DNA,
  		SUM(CASE molecule WHEN 'RNA' THEN 1 ELSE 0 END) AS RNA,
  		SUM(CASE molecule WHEN 'Other' THEN 1 ELSE 0 END) AS Other,
  		COUNT(*) AS Total
  		FROM quadruplex_view;"
  
  Query_ONZ_class_coverage_by_uni_bi_and_tetramolecular_tetrad <-
    "SELECT CAST(onz AS text),
      SUM(CASE tv.chains WHEN 1 THEN 1 ELSE 0 END) AS Unimolecular,
      SUM(CASE tv.chains WHEN 2 THEN 1 ELSE 0 END) AS Bimolecular,
      SUM(CASE tv.chains WHEN 4 THEN 1 ELSE 0 END) AS Tetramolecular,
      COUNT(*) AS Total
      FROM tetrad_view tv
      JOIN quadruplex_view qv on tv.quadruplex_id = qv.id
      WHERE qv.count > 1
      GROUP BY onz
      UNION ALL
      SELECT 'Total',
      SUM(CASE tv.chains WHEN 1 THEN 1 ELSE 0 END) AS Unimolecular,
      SUM(CASE tv.chains WHEN 2 THEN 1 ELSE 0 END) AS Bimolecular,
      SUM(CASE tv.chains WHEN 4 THEN 1 ELSE 0 END) AS Tetramolecular,
      COUNT(*) AS Total
      FROM tetrad_view tv
      JOIN quadruplex_view qv on tv.quadruplex_id = qv.id
      WHERE qv.count > 1;"
  
  Query_ONZM_class_coverage_by_unimolecular_quadruplexes <- 
    "SELECT CAST(onzm AS text),
      SUM(CASE subtype WHEN '+' THEN 1 ELSE 0 END) AS Plus,
      SUM(CASE subtype WHEN '-' THEN 1 ELSE 0 END) AS Minus,
      SUM(CASE subtype WHEN '*' THEN 1 ELSE 0 END) AS Star,
      COUNT(*) AS Total
      FROM quadruplex_view
      WHERE chains = 1
      GROUP BY onzm
      UNION ALL
      SELECT 'Total',
      SUM(CASE subtype WHEN '+' THEN 1 ELSE 0 END) AS Plus,
      SUM(CASE subtype WHEN '-' THEN 1 ELSE 0 END) AS Minus,
      SUM(CASE subtype WHEN '*' THEN 1 ELSE 0 END) AS Star,
      COUNT(*) AS Total
      FROM quadruplex_view
      WHERE chains = 1;"
  
  Query_ONZM_class_coverage_by_bimolecular_quadruplexes <- 
    "SELECT CAST(onzm AS text),
      SUM(CASE subtype WHEN '+' THEN 1 ELSE 0 END) AS Plus,
      SUM(CASE subtype WHEN '-' THEN 1 ELSE 0 END) AS Minus,
      SUM(CASE subtype WHEN '*' THEN 1 ELSE 0 END) AS Star,
      COUNT(*) AS Total
      FROM quadruplex_view
      WHERE chains = 2
      GROUP BY onzm
      UNION ALL
      SELECT 'Total',
      SUM(CASE subtype WHEN '+' THEN 1 ELSE 0 END) AS Plus,
      SUM(CASE subtype WHEN '-' THEN 1 ELSE 0 END) AS Minus,
      SUM(CASE subtype WHEN '*' THEN 1 ELSE 0 END) AS Star,
      COUNT(*) AS Total
      FROM quadruplex_view
      WHERE chains = 2;"
  
  Query_ONZM_class_coverage_by_tetramolecular_quadruplexes <- 
    "SELECT CAST(onzm AS text),
      SUM(CASE subtype WHEN '+' THEN 1 ELSE 0 END) AS Plus,
      SUM(CASE subtype WHEN '-' THEN 1 ELSE 0 END) AS Minus,
      SUM(CASE subtype WHEN '*' THEN 1 ELSE 0 END) AS Star,
      COUNT(*) AS Total
      FROM quadruplex_view
      WHERE chains = 4
      GROUP BY onzm
      UNION ALL
      SELECT 'Total',
      SUM(CASE subtype WHEN '+' THEN 1 ELSE 0 END) AS Plus,
      SUM(CASE subtype WHEN '-' THEN 1 ELSE 0 END) AS Minus,
      SUM(CASE subtype WHEN '*' THEN 1 ELSE 0 END) AS Star,
      COUNT(*) AS Total
      FROM quadruplex_view
      WHERE chains = 4;"
  
  Query_loop_length_propeller_plus <- 
    "SELECT 
  	LENGTH(STRING_AGG(COALESCE(n.short_name, ''), '')) as loop_length,
  	l.loop_type as loop_type
  	FROM quadruplex q
  	JOIN loop l on q.id = l.quadruplex_id
  	JOIN loop_nucleotide ln on l.id = ln.loop_id
  	JOIN nucleotide n on ln.nucleotide_id = n.id
  	where loop_type in ('propeller+')
  	GROUP BY l.id"
  
  Query_loop_length_propeller_minus <- 
    "SELECT 
  	LENGTH(STRING_AGG(COALESCE(n.short_name, ''), '')) as loop_length,
  	l.loop_type as loop_type
  	FROM quadruplex q
  	JOIN loop l on q.id = l.quadruplex_id
  	JOIN loop_nucleotide ln on l.id = ln.loop_id
  	JOIN nucleotide n on ln.nucleotide_id = n.id
  	where loop_type in ('propeller-')
  	GROUP BY l.id"
  
  Query_loop_length_lateral_plus <- 
    "SELECT 
  	LENGTH(STRING_AGG(COALESCE(n.short_name, ''), '')) as loop_length,
  	l.loop_type as loop_type
  	FROM quadruplex q
  	JOIN loop l on q.id = l.quadruplex_id
  	JOIN loop_nucleotide ln on l.id = ln.loop_id
  	JOIN nucleotide n on ln.nucleotide_id = n.id
  	where loop_type in ('lateral+')
  	GROUP BY l.id"
  
  Query_loop_length_lateral_minus <- 
    "SELECT 
  	LENGTH(STRING_AGG(COALESCE(n.short_name, ''), '')) as loop_length,
  	l.loop_type as loop_type
  	FROM quadruplex q
  	JOIN loop l on q.id = l.quadruplex_id
  	JOIN loop_nucleotide ln on l.id = ln.loop_id
  	JOIN nucleotide n on ln.nucleotide_id = n.id
  	where loop_type in ('lateral-')
  	GROUP BY l.id"
  
  Query_loop_length_diagonal <- 
    "SELECT 
  	LENGTH(STRING_AGG(COALESCE(n.short_name, ''), '')) as loop_length,
  	l.loop_type as loop_type
  	FROM quadruplex q
  	JOIN loop l on q.id = l.quadruplex_id
  	JOIN loop_nucleotide ln on l.id = ln.loop_id
  	JOIN nucleotide n on ln.nucleotide_id = n.id
  	where loop_type in ('diagonal')
  	GROUP BY l.id"
  
  Query_loop_length <-
    "select count(*), loop_length from
  (SELECT 
  	LENGTH(STRING_AGG(COALESCE(n.short_name, ''), ''))::text as loop_length
  	FROM quadruplex q
  	JOIN loop l on q.id = l.quadruplex_id
  	JOIN loop_nucleotide ln on l.id = ln.loop_id
  	JOIN nucleotide n on ln.nucleotide_id = n.id
  	GROUP BY l.id) as s1
  	group by loop_length"
  Query_gba_quadruples_da_silva_class <-
      "select count(*) as Total, s1.TetradCombination as gba_quadruplex_class 
    from (SELECT
    	STRING_AGG(DISTINCT(qg.gba_quadruplex_class)::text,', ') AS TetradCombination
    FROM QUADRUPLEX q
    JOIN QUADRUPLEX_GBA qg on qg.quadruplex_id = q.id
    group by q.id) as s1
    group by s1.TetradCombination"
  
  Query_loop_da_silva_class <-
    "SELECT
  	count(*) as Total,
  	loop_class
  FROM quadruplex 
  where loop_class not in ('n/a') 
  group by loop_class
  UNION
  SELECT
  	count(*) as Total,
  	q.loop_class as loop_class
  FROM QUADRUPLEX q
  JOIN QUADRUPLEX_VIEW q_view ON q.id = q_view.id
  where q.loop_class in ('n/a') and q_view.chains in ('1')
  GROUP BY q.loop_class, q_view.chains"
  
  Query_planarity_rise_twist_values <-
    "SELECT 
  	t.planarity_deviation as planarity,
  	tp.rise as rise,
  	tp.twist as twist
    FROM tetrad t
  	LEFT JOIN tetrad_pair tp on t.id = tp.tetrad1_id"
  
  Query_ion_o_plus <-
    "SELECT
  	ion.name as ion,
  	count(*) as total
    FROM QUADRUPLEX q
    JOIN TETRAD t ON q.id = t.quadruplex_id
    JOIN NUCLEOTIDE n1 ON t.nt1_id = n1.id
    JOIN PDB p ON n1.pdb_id = p.id
    JOIN pdb_ion ON p.id = pdb_ion.pdb_id
    JOIN ion ON ion.id = pdb_ion.ion_id
    where onz in ('O+')
    GROUP BY ion"
  
  get_query_ion.function <- function(arg){
    query <- sprintf("SELECT
  	ion.name as ion,
  	count(*) as total
    FROM QUADRUPLEX q
    JOIN TETRAD t ON q.id = t.quadruplex_id
    JOIN NUCLEOTIDE n1 ON t.nt1_id = n1.id
    JOIN PDB p ON n1.pdb_id = p.id
    JOIN pdb_ion ON p.id = pdb_ion.pdb_id
    JOIN ion ON ion.id = pdb_ion.ion_id
    where onz in ('%s')
    GROUP BY ion", arg)
    return (query)
  }
  
  get_query_chi_value.function <- function(arg) {
    query <-
      sprintf("SELECT 
  	chi,
  	glycosidic_bond as glycosidic_bond
   	from((SELECT 
  	t.onz as onz,
  	n1.chi as chi,
      n1.glycosidic_bond as glycosidic_bond
  	FROM tetrad t 
  	JOIN quadruplex q on q.id = t.quadruplex_id
  	JOIN nucleotide n1 on t.nt1_id = n1.id)
  UNION ALL
  	(SELECT 
  	 t.onz as onz,
  	n2.chi as chi,
      n2.glycosidic_bond as glycosidic_bond
  	FROM tetrad t 
  	JOIN quadruplex q on q.id = t.quadruplex_id
  	JOIN nucleotide n2 on t.nt2_id = n2.id)
  UNION ALL
  	(SELECT 
  	 t.onz as onz,
  	n3.chi as chi,
      n3.glycosidic_bond as glycosidic_bond
  	FROM tetrad t 
  	JOIN quadruplex q on q.id = t.quadruplex_id
  	JOIN nucleotide n3 on t.nt3_id = n3.id)
  UNION ALL
  	(SELECT 
  	 t.onz as onz,
  	n4.chi as chi,
      n4.glycosidic_bond as glycosidic_bond
  	FROM tetrad t 
  	JOIN quadruplex q on q.id = t.quadruplex_id
  	JOIN nucleotide n4 on t.nt4_id = n4.id)) as t
  	where onz in ('%s') and glycosidic_bond in ('%s')
  group by glycosidic_bond, onz, chi", arg[1], arg[2])
  
    return(query)
  }
  
  #  number_of_tetrads_by_sequence_and_molecule_type
  table <- dbGetQuery(con, Query_number_of_tetrads_by_sequence_and_molecule_type)
  number_of_tetrads_by_sequence_and_molecule_type <- prepere_data_for_plot.function(table)
  
  number_of_tetrads_by_sequence_and_molecule_type$cleaned_labels <- toupper(number_of_tetrads_by_sequence_and_molecule_type$cleaned_labels)
  #plot_ly(number_of_tetrads_by_sequence_and_molecule_type, ids = ~cleaned_ids, labels = ~cleaned_labels, parents = ~cleaned_parents, values = ~cleaned_values, type = 'sunburst', branchvalues = 'total') %>% layout(colorway = number_of_tetrads_by_sequence_and_molecule_type$colors)
  p <- plot_ly(number_of_tetrads_by_sequence_and_molecule_type,
               texttemplate = "%{label}: %{value:,s} <br>(%{percentParent})",
               hovertemplate = "Label: %{label} <br>Count: %{value} </br>Percentage: %{percentParent:%}<extra></extra> ",
               ids = ~cleaned_ids, labels = ~cleaned_labels, parents = ~cleaned_parents,values = ~cleaned_values, type = 'sunburst', branchvalues = 'total') %>% layout(colorway = number_of_tetrads_by_sequence_and_molecule_type$colors)
  save_plot_widget.function(p, file = "number_of_tetrads_by_sequence_and_molecule_type.html")
  
  
  # number_of_quadruplexes_composed_of_2_12_tetrads
  table <- dbGetQuery(con, Query_number_of_quadruplexes_composed_of_2_12_tetrads)
  number_of_quadruplexes_composed_of_2_12_tetrads <- prepere_data_for_plot.function(table)
  
  labels <- number_of_quadruplexes_composed_of_2_12_tetrads$cleaned_labels
  labels_tmp <- toupper(labels)
  for(i in 4:length(labels))
  {
    labels_tmp[i] <- paste(labels_tmp[i],"tetrads",sep=" ")
  }
  number_of_quadruplexes_composed_of_2_12_tetrads$cleaned_labels = labels_tmp
  
  #plot_ly(number_of_quadruplexes_composed_of_2_12_tetrads, ids = ~cleaned_ids, labels = ~cleaned_labels, parents = ~cleaned_parents, values = ~cleaned_values, type = 'sunburst', branchvalues = 'total') %>% layout(colorway = number_of_quadruplexes_composed_of_2_12_tetrads$colors)
  p <- plot_ly(number_of_quadruplexes_composed_of_2_12_tetrads, 
               texttemplate = "%{label}: %{value:,s} <br>(%{percentParent})",
               hovertemplate = "Label: %{label} <br>Count: %{value} </br>Percentage: %{percentParent:%}<extra></extra> ",
               ids = ~cleaned_ids, labels = ~cleaned_labels, parents = ~cleaned_parents,values = ~cleaned_values, type = 'sunburst', branchvalues = 'total') %>% layout(colorway = number_of_quadruplexes_composed_of_2_12_tetrads$colors)
  save_plot_widget.function(p, file = "number_of_quadruplexes_composed_of_2_12_tetrads.html")
  
  
  # number_of_uni_bi_and_tetramolecular_quadruplexes
  table <- dbGetQuery(con, Query_number_of_uni_bi_and_tetramolecular_quadruplexes)
  number_of_uni_bi_and_tetramolecular_quadruplexes <- prepere_data_for_plot.function(table)
  
  labels <- number_of_uni_bi_and_tetramolecular_quadruplexes$cleaned_labels
  labels_tmp <- toupper(labels)
  for(i in 4:length(labels))
  {
    if(labels_tmp[i] == 1) 
      labels_tmp[i] <- "unimolecular"
    else if(labels_tmp[i] == 2) 
      labels_tmp[i] <- "bimolecular"
    else if(labels_tmp[i] == 4)
      labels_tmp[i] <- "tetramolecular"
    
  }
  number_of_uni_bi_and_tetramolecular_quadruplexes$cleaned_labels = labels_tmp
  
  #plot_ly(number_of_uni_bi_and_tetramolecular_quadruplexes, ids = ~cleaned_ids, labels = ~cleaned_labels, parents = ~cleaned_parents, values = ~cleaned_values, type = 'sunburst', branchvalues = 'total') %>% layout(colorway = number_of_uni_bi_and_tetramolecular_quadruplexes$colors)
  p <- plot_ly(number_of_uni_bi_and_tetramolecular_quadruplexes,
               texttemplate = "%{label}: %{value:,s} <br>(%{percentParent})",
               hovertemplate = "Label: %{label} <br>Count: %{value} </br>Percentage: %{percentParent:%}<extra></extra> ",
               ids = ~cleaned_ids, labels = ~cleaned_labels, parents = ~cleaned_parents,values = ~cleaned_values, type = 'sunburst', branchvalues = 'total') %>% layout(colorway = number_of_uni_bi_and_tetramolecular_quadruplexes$colors)
  save_plot_widget.function(p, file = "number_of_uni_bi_and_tetramolecular_quadruplexes.html")
  
  
  # ONZ_class_coverage_by_uni_bi_and_tetramolecular_tetrad
  table <- dbGetQuery(con, Query_ONZ_class_coverage_by_uni_bi_and_tetramolecular_tetrad)
  ONZ_class_coverage_by_uni_bi_and_tetramolecular_tetrad <- prepere_data_for_plot.function(table)
  
  #plot_ly(ONZ_class_coverage_by_uni_bi_and_tetramolecular_tetrad, ids = ~cleaned_ids, labels = ~cleaned_labels, parents = ~cleaned_parents, values = ~cleaned_values, type = 'sunburst', branchvalues = 'total') %>% layout(colorway = ONZ_class_coverage_by_uni_bi_and_tetramolecular_tetrad$colors)
  p <- plot_ly(ONZ_class_coverage_by_uni_bi_and_tetramolecular_tetrad, 
               texttemplate = "%{label}: %{value:,s} <br>(%{percentParent})",
               hovertemplate = "Label: %{label} <br>Count: %{value} </br>Percentage: %{percentParent:%}<extra></extra> ",
               ids = ~cleaned_ids, labels = ~cleaned_labels, parents = ~cleaned_parents,values = ~cleaned_values, type = 'sunburst', branchvalues = 'total') %>% layout(colorway = ONZ_class_coverage_by_uni_bi_and_tetramolecular_tetrad$colors)
  save_plot_widget.function(p, file = "ONZ_class_coverage_by_uni_bi_and_tetramolecular_tetrad.html")
  
  
  # ONZM_class_coverage_by_unimolecular_quadruplexes
  table <- dbGetQuery(con, Query_ONZM_class_coverage_by_unimolecular_quadruplexes)
  ONZM_class_coverage_by_unimolecular_quadruplexes <- prepere_data_for_plot.function(table)
  
  labels <- ONZM_class_coverage_by_unimolecular_quadruplexes$cleaned_labels
  labels_tmp <- labels
  for(i in 1:length(labels))
  {
    if(labels_tmp[i] =="star") 
      labels_tmp[i] <- 'star (*)'
    else if(labels_tmp[i] == "minus") 
      labels_tmp[i] <- "minus (-)"
    else if(labels_tmp[i] == "plus")
      labels_tmp[i] <- "plus (+)"
    
  }
  ONZM_class_coverage_by_unimolecular_quadruplexes$cleaned_labels = labels_tmp
  
  #plot_ly(ONZM_class_coverage_by_unimolecular_quadruplexes, ids = ~cleaned_ids, labels = ~cleaned_labels, parents = ~cleaned_parents, values = ~cleaned_values, type = 'sunburst', branchvalues = 'total') %>% layout(colorway = ONZM_class_coverage_by_unimolecular_quadruplexes$colors)
  p <- plot_ly(ONZM_class_coverage_by_unimolecular_quadruplexes, ids = ~cleaned_ids, 
               labels = ~cleaned_labels, parents = ~cleaned_parents,values = ~cleaned_values,
               texttemplate = "%{label}: %{value:,s} <br>(%{percentParent})",
               hovertemplate = "Label: %{label} <br>Count: %{value} </br>Percentage: %{percentParent:%}<extra></extra> ",
               type = 'sunburst', branchvalues = 'total') %>% layout(colorway = ONZM_class_coverage_by_unimolecular_quadruplexes$colors)
  save_plot_widget.function(p, file = "ONZM_class_coverage_by_unimolecular_quadruplexes.html")
  
  
  # ONZM_class_coverage_by_bimolecular_quadruplexes
  table <- dbGetQuery(con, Query_ONZM_class_coverage_by_bimolecular_quadruplexes)
  ONZM_class_coverage_by_bimolecular_quadruplexes <- prepere_data_for_plot.function(table)
  
  labels <- ONZM_class_coverage_by_bimolecular_quadruplexes$cleaned_labels
  labels_tmp <- labels
  for(i in 1:length(labels))
  {
    if(labels_tmp[i] =="star") 
      labels_tmp[i] <- 'star (*)'
    else if(labels_tmp[i] == "minus") 
      labels_tmp[i] <- "minus (-)"
    else if(labels_tmp[i] == "plus")
      labels_tmp[i] <- "plus (+)"
    
  }
  ONZM_class_coverage_by_bimolecular_quadruplexes$cleaned_labels = labels_tmp
  
  #plot_ly(ONZM_class_coverage_by_bimolecular_quadruplexes, ids = ~cleaned_ids, labels = ~cleaned_labels, parents = ~cleaned_parents, values = ~cleaned_values, type = 'sunburst', branchvalues = 'total') %>% layout(colorway = ONZM_class_coverage_by_bimolecular_quadruplexes$colors)
  p <- plot_ly(ONZM_class_coverage_by_bimolecular_quadruplexes, 
               ids = ~cleaned_ids, labels = ~cleaned_labels,
               parents = ~cleaned_parents,values = ~cleaned_values,
               texttemplate = "%{label}: %{value:,s} <br>(%{percentParent})",
               hovertemplate = "Label: %{label} <br>Count: %{value} </br>Percentage: %{percentParent:%}<extra></extra> ",
               type = 'sunburst', branchvalues = 'total') %>% layout(colorway = ONZM_class_coverage_by_bimolecular_quadruplexes$colors)
  save_plot_widget.function(p, file = "ONZM_class_coverage_by_bimolecular_quadruplexes.html")
  
  
  # ONZM_class_coverage_by_tetramolecular_quadruplexes
  table <- dbGetQuery(con, Query_ONZM_class_coverage_by_tetramolecular_quadruplexes)
  ONZM_class_coverage_by_tetramolecular_quadruplexes <- prepere_data_for_plot.function(table)
  
  labels <- ONZM_class_coverage_by_tetramolecular_quadruplexes$cleaned_labels
  labels_tmp <- labels
  for(i in 1:length(labels))
  {
    if(labels_tmp[i] =="star") 
      labels_tmp[i] <- 'star (*)'
    else if(labels_tmp[i] == "minus") 
      labels_tmp[i] <- "minus (-)"
    else if(labels_tmp[i] == "plus")
      labels_tmp[i] <- "plus (+)"
    
  }
  ONZM_class_coverage_by_tetramolecular_quadruplexes$cleaned_labels = labels_tmp
  
  #plot_ly(ONZM_class_coverage_by_tetramolecular_quadruplexes, ids = ~cleaned_ids, labels = ~cleaned_labels, parents = ~cleaned_parents, values = ~cleaned_values, type = 'sunburst', branchvalues = 'total') %>% layout(colorway = ONZM_class_coverage_by_tetramolecular_quadruplexes$colors)
  p <- plot_ly(ONZM_class_coverage_by_tetramolecular_quadruplexes,
               ids = ~cleaned_ids,
               labels = ~cleaned_labels,
               parents = ~cleaned_parents,
               values = ~cleaned_values,
               type = 'sunburst',
               texttemplate = "%{label}: %{value:,s} <br>(%{percentParent})",
               hovertemplate = "Label: %{label} <br>Count: %{value} </br>Percentage: %{percentParent:%}<extra></extra> ",
               branchvalues = 'total') %>% layout(colorway = ONZM_class_coverage_by_tetramolecular_quadruplexes$colors)
  
  save_plot_widget.function(p, file = "ONZM_class_coverage_by_tetramolecular_quadruplexes.html")
  
  
  texttemplate = "%{label}: %{value:,s} <br>(%{percent})"
  hovertemplate = "Label: %{label} <br>Count: %{text} </br>Percentage: %{percent}<extra></extra> "
  
  
  
  # Loop length by propeller
  propeller_plus <- dbGetQuery(con, Query_loop_length_propeller_plus)
  propeller_minus <- dbGetQuery(con, Query_loop_length_propeller_minus)
  p <- plot_ly(alpha = 0.6)
  
  f <- list(
    family = "Courier New, monospace",
    size = 12,
    color = "#696969"
  )
  x <- list(
    title = "Loop length",
    titlefont = f
  )
  y <- list(
    title = "Count",
    titlefont = f
  )
  p <- p %>% layout(barmode = "overlay", xaxis = x, yaxis = y)
  p <- p %>% add_histogram(x = propeller_minus$loop_length, name='propeller-')
  p <- p %>% add_histogram(x = propeller_plus$loop_length, name='propeller+')
  save_plot_widget.function(p, file = "Loop_length_by_propeller.html")
  
  # Loop length by lateral
  lateral_plus <- dbGetQuery(con, Query_loop_length_lateral_plus)
  lateral_minus <- dbGetQuery(con, Query_loop_length_lateral_minus)
  
  p <- plot_ly(alpha = 0.6)
  f <- list(
    family = "Courier New, monospace",
    size = 12,
    color = "#696969"
  )
  x <- list(
    title = "Loop length",
    titlefont = f
  )
  y <- list(
    title = "Count",
    titlefont = f
  )
  p <- p %>% layout(barmode = "overlay", xaxis = x, yaxis = y)
  p <- p %>% add_histogram(x = lateral_minus$loop_length, name='lateral-')
  p <- p %>% add_histogram(x = lateral_plus$loop_length, name='lateral+')
  p <- p %>% layout(barmode = "overlay")
  save_plot_widget.function(p, file = "Loop_length_by_lateral.html")
  
  
  # Loop length diagonal
  diagonal <- dbGetQuery(con, Query_loop_length_diagonal)
  p <- plot_ly(alpha = 0.6)
  f <- list(
    family = "Courier New, monospace",
    size = 12,
    color = "#696969"
  )
  x <- list(
    title = "Loop length",
    titlefont = f
  )
  y <- list(
    title = "Count",
    titlefont = f
  )
  p <- p %>% layout(barmode = "overlay", xaxis = x, yaxis = y)
  p <- p %>% add_histogram(x = diagonal$loop_length, name='diagonal')
  p <- p %>% layout(barmode = "overlay")
  save_plot_widget.function(p, file = "Loop_length_by_diagonal.html")
  
  
  #GBA DA SILVA
  gba_da_silva <- dbGetQuery(con, Query_gba_quadruples_da_silva_class)
  count = sum(gba_da_silva$total)
  others <- subset( gba_da_silva, total/count < 0.01)
  gba_da_silva <-subset( gba_da_silva, total/count > 0.01)
  gba_da_silva[nrow(gba_da_silva) + 1,] = list(sum(others$total),"Other")
  
  
  colors <- c('rgb(211,94,96)', 'rgb(128,133,133)', 'rgb(144,103,167)', 'rgb(171,104,87)', 'rgb(114,147,203)')
  fig <- plot_ly(gba_da_silva, labels = ~gba_quadruplex_class, values = ~total, type = 'pie',
                 textposition = 'inside',
                 texttemplate = "%{label}: %{value:,s} <br>(%{percent})",
                 insidetextfont = list(color = '#FFFFFF'),
                 hovertemplate = "Label: %{label} <br>Count: %{text} </br>Percentage: %{percent}<extra></extra> ",
                 text = ~paste(total),
                 marker = list(colors = colors,
                               line = list(color = '#FFFFFF', width = 1)),
                 #The 'pull' attribute can also be used to create space between the sectors
                 showlegend = FALSE)
  fig <- fig %>% layout(title = '',
                        xaxis = list(showgrid = FALSE, zeroline = FALSE, showticklabels = FALSE),
                        yaxis = list(showgrid = FALSE, zeroline = FALSE, showticklabels = FALSE))
  
  p <- plot_ly(gba_da_silva, labels = ~gba_quadruplex_class, values = ~total, type = 'treemap',  parents = NA,
               texttemplate = "%{label}: %{value:,s}",
               hovertemplate = "Label: %{label} <br>Count: %{value}<extra></extra>")
  
  save_plot_widget.function(p, file = "GBA_da_Silva_treemap.html")
  save_plot_widget.function(fig, file = "GBA_da_Silva_pie.html")
  
  
  #LOOP DA SILVA
  loop_da_silva <- dbGetQuery(con, Query_loop_da_silva_class)
  
  colors <- c('rgb(211,94,96)', 'rgb(128,133,133)', 'rgb(144,103,167)', 'rgb(171,104,87)', 'rgb(114,147,203)')
  fig <- plot_ly(loop_da_silva, labels = ~loop_class, values = ~total, type = 'pie',
                 textposition = 'inside',
                 texttemplate = "%{label}: %{value:,s} <br>(%{percent})",
                 insidetextfont = list(color = '#FFFFFF'),
                 hovertemplate = "Label: %{label} <br>Count: %{text} </br>Percentage: %{percent}<extra></extra> ",
                 text = ~paste(total),
                 marker = list(colors = colors,
                               line = list(color = '#FFFFFF', width = 1)),
                 showlegend = FALSE)
  fig <- fig %>% layout(title = '',
                        xaxis = list(showgrid = FALSE, zeroline = FALSE, showticklabels = FALSE),
                        yaxis = list(showgrid = FALSE, zeroline = FALSE, showticklabels = FALSE))
  
  
  p <- plot_ly(loop_da_silva, labels = ~loop_class, values = ~total, type = 'treemap',  parents = NA,
               texttemplate = "%{label}: %{value:,s}",
               hovertemplate = "Label: %{label} <br>Count: %{value}<extra></extra>")
  
  save_plot_widget.function(p, file = "loop_da_Silva_treemap.html")
  save_plot_widget.function(fig, file = "loop_da_Silva_pie.html")
  
  #RISE TWIST PLANARITY
  rise_twist_planarity <- dbGetQuery(con, Query_planarity_rise_twist_values)
  
  #planarity
  p <- plot_ly(alpha = 0.6)
  f <- list(
    family = "Courier New, monospace",
    size = 12,
    color = "#696969"
  )
  x <- list(
    title = "Planarity value",
    titlefont = f
  )
  y <- list(
    title = "Count",
    titlefont = f
  )
  p <- p %>% layout(barmode = "overlay", xaxis = x, yaxis = y)
  p <- p %>% add_histogram(x = rise_twist_planarity$planarity, name='planarity')
  p <- p %>% layout(barmode = "overlay")
  save_plot_widget.function(p, file = "planarity.html")
  
  #rise
  p <- plot_ly(alpha = 0.6)
  f <- list(
    family = "Courier New, monospace",
    size = 12,
    color = "#696969"
  )
  x <- list(
    title = "Rise value",
    titlefont = f
  )
  y <- list(
    title = "Count",
    titlefont = f
  )
  p <- p %>% layout(barmode = "overlay", xaxis = x, yaxis = y)
  p <- p %>% add_histogram(x = rise_twist_planarity$rise, name='planarity')
  p <- p %>% layout(barmode = "overlay")
  save_plot_widget.function(p, file = "rise.html")
  
  #twist
  p <- plot_ly(alpha = 0.6)
  f <- list(
    family = "Courier New, monospace",
    size = 12,
    color = "#696969"
  )
  x <- list(
    title = "Twist value",
    titlefont = f
  )
  y <- list(
    title = "Count",
    titlefont = f
  )
  p <- p %>% layout(barmode = "overlay", xaxis = x, yaxis = y)
  p <- p %>% add_histogram(x = rise_twist_planarity$twist, name='planarity')
  p <- p %>% layout(barmode = "overlay")
  save_plot_widget.function(p, file = "twist.html")
  
  # chi value o plus syn/anti
  chi_anti_o_plus <- dbGetQuery(con, get_query_chi_value.function(c('O+', 'anti')))
  chi_syn_o_plus <- dbGetQuery(con, get_query_chi_value.function(c('O+', 'syn')))
  
  p <- plot_ly(alpha = 0.6)
  f <- list(
    family = "Courier New, monospace",
    size = 12,
    color = "#696969"
  )
  x <- list(
    title = "Chi angle value",
    titlefont = f
  )
  y <- list(
    title = "Count",
    titlefont = f
  )
  p <- p %>% layout(barmode = "overlay", xaxis = x, yaxis = y)
  p <- p %>% add_histogram(x = chi_anti_o_plus$chi, name='anti')
  p <- p %>% add_histogram(x = chi_syn_o_plus$chi, name='syn')
  p <- p %>% layout(barmode = "overlay")
  save_plot_widget.function(p, file = "chi_value_o_plus.html")
  
  # chi value o minus syn/anti
  chi_anti_o_minus <- dbGetQuery(con, get_query_chi_value.function(c('O-', 'anti')))
  chi_syn_o_minus <- dbGetQuery(con, get_query_chi_value.function(c('O-', 'syn')))
  
  p <- plot_ly(alpha = 0.6)
  f <- list(
    family = "Courier New, monospace",
    size = 12,
    color = "#696969"
  )
  x <- list(
    title = "Chi angle value",
    titlefont = f
  )
  y <- list(
    title = "Count",
    titlefont = f
  )
  p <- p %>% layout(barmode = "overlay", xaxis = x, yaxis = y)
  p <- p %>% add_histogram(x = chi_anti_o_minus$chi, name='anti')
  p <- p %>% add_histogram(x = chi_syn_o_minus$chi, name='syn')
  p <- p %>% layout(barmode = "overlay")
  save_plot_widget.function(p, file = "chi_value_o_minus.html")
  
  # chi value n plus syn/anti
  chi_anti_n_plus <- dbGetQuery(con, get_query_chi_value.function(c('N+', 'anti')))
  chi_syn_n_plus <- dbGetQuery(con, get_query_chi_value.function(c('N+', 'syn')))
  
  p <- plot_ly(alpha = 0.6)
  f <- list(
    family = "Courier New, monospace",
    size = 12,
    color = "#696969"
  )
  x <- list(
    title = "Chi angle value",
    titlefont = f
  )
  y <- list(
    title = "Count",
    titlefont = f
  )
  p <- p %>% layout(barmode = "overlay", xaxis = x, yaxis = y)
  p <- p %>% add_histogram(x = chi_anti_n_plus$chi, name='anti')
  p <- p %>% add_histogram(x = chi_syn_n_plus$chi, name='syn')
  p <- p %>% layout(barmode = "overlay")
  save_plot_widget.function(p, file = "chi_value_n_plus.html")
  
  # chi value n minus syn/anti
  chi_anti_n_minus <- dbGetQuery(con, get_query_chi_value.function(c('N-', 'anti')))
  chi_syn_n_minus <- dbGetQuery(con, get_query_chi_value.function(c('N-', 'syn')))
  
  p <- plot_ly(alpha = 0.6)
  f <- list(
    family = "Courier New, monospace",
    size = 12,
    color = "#696969"
  )
  x <- list(
    title = "Chi angle value",
    titlefont = f
  )
  y <- list(
    title = "Count",
    titlefont = f
  )
  p <- p %>% layout(barmode = "overlay", xaxis = x, yaxis = y)
  p <- p %>% add_histogram(x = chi_anti_n_minus$chi, name='anti')
  p <- p %>% add_histogram(x = chi_syn_n_minus$chi, name='syn')
  p <- p %>% layout(barmode = "overlay")
  save_plot_widget.function(p, file = "chi_value_n_minus.html")
  
  # chi value z plus syn/anti
  chi_anti_z_plus <- dbGetQuery(con, get_query_chi_value.function(c('Z+', 'anti')))
  chi_syn_z_plus <- dbGetQuery(con, get_query_chi_value.function(c('Z+', 'syn')))
  
  p <- plot_ly(alpha = 0.6)
  f <- list(
    family = "Courier New, monospace",
    size = 12,
    color = "#696969"
  )
  x <- list(
    title = "Chi angle value",
    titlefont = f
  )
  y <- list(
    title = "Count",
    titlefont = f
  )
  p <- p %>% layout(barmode = "overlay", xaxis = x, yaxis = y)
  p <- p %>% add_histogram(x = chi_anti_z_plus$chi, name='anti')
  p <- p %>% add_histogram(x = chi_syn_z_plus$chi, name='syn')
  p <- p %>% layout(barmode = "overlay")
  save_plot_widget.function(p, file = "chi_value_z_plus.html")
  
  # chi value z minus syn/anti
  chi_anti_z_minus <- dbGetQuery(con, get_query_chi_value.function(c('Z-', 'anti')))
  chi_syn_z_minus <- dbGetQuery(con, get_query_chi_value.function(c('Z-', 'syn')))
  
  p <- plot_ly(alpha = 0.6)
  f <- list(
    family = "Courier New, monospace",
    size = 12,
    color = "#696969"
  )
  x <- list(
    title = "Chi angle value",
    titlefont = f
  )
  y <- list(
    title = "Count",
    titlefont = f
  )
  p <- p %>% layout(barmode = "overlay", xaxis = x, yaxis = y)
  p <- p %>% add_histogram(x = chi_anti_z_minus$chi, name='anti')
  p <- p %>% add_histogram(x = chi_syn_z_minus$chi, name='syn')
  p <- p %>% layout(barmode = "overlay")
  save_plot_widget.function(p, file = "chi_value_z_minus.html")
  
  
  # Query_ion_o_plus
  ion_o_plus <- dbGetQuery(con, get_query_ion.function("O+"))
  ion_o_plus$ion <- gsub('\\s+', '', ion_o_plus$ion)
  
  colors <- c('rgb(211,94,96)', 'rgb(128,133,133)', 'rgb(144,103,167)', 'rgb(171,104,87)', 'rgb(114,147,203)')
  fig <- plot_ly(ion_o_plus, labels = ~ion, values = ~total, type = 'pie',
                 textposition = 'inside',
                 texttemplate = "%{label}: %{value:,s} <br>(%{percent})",
                 insidetextfont = list(color = '#FFFFFF'),
                 hovertemplate = "Label: %{label} <br>Count: %{text} </br>Percentage: %{percent}<extra></extra> ",
                 text = ~paste(total),
                 marker = list(colors = colors,
                               line = list(color = '#FFFFFF', width = 1)),
                 showlegend = FALSE)
  fig <- fig %>% layout(title = '',
                        xaxis = list(showgrid = FALSE, zeroline = FALSE, showticklabels = FALSE),
                        yaxis = list(showgrid = FALSE, zeroline = FALSE, showticklabels = FALSE))
  
  
  p <- plot_ly(ion_o_plus, labels = ~ion, values = ~total, type = 'treemap',  parents = NA,
               texttemplate = "%{label}: %{value:,s}",
               hovertemplate = "Label: %{label} <br>Count: %{value}<extra></extra>")
  
  save_plot_widget.function(p, file = "ion_o_plus_treemap.html")
  save_plot_widget.function(fig, file = "ion_o_plus_pie.html")
  
  # Query_ion_o_minus
  ion_o_minus <- dbGetQuery(con, get_query_ion.function('O-'))
  ion_o_minus$ion <- gsub('\\s+', '', ion_o_minus$ion)
  
  colors <- c('rgb(211,94,96)', 'rgb(128,133,133)', 'rgb(144,103,167)', 'rgb(171,104,87)', 'rgb(114,147,203)')
  fig <- plot_ly(ion_o_minus, labels = ~ion, values = ~total, type = 'pie',
                 textposition = 'inside',
                 texttemplate = "%{label}: %{value:,s} <br>(%{percent})",
                 insidetextfont = list(color = '#FFFFFF'),
                 hovertemplate = "Label: %{label} <br>Count: %{text} </br>Percentage: %{percent}<extra></extra> ",
                 text = ~paste(total),
                 marker = list(colors = colors,
                               line = list(color = '#FFFFFF', width = 1)),
                 showlegend = FALSE)
  fig <- fig %>% layout(title = '',
                        xaxis = list(showgrid = FALSE, zeroline = FALSE, showticklabels = FALSE),
                        yaxis = list(showgrid = FALSE, zeroline = FALSE, showticklabels = FALSE))
  
  
  p <- plot_ly(ion_o_minus, labels = ~ion, values = ~total, type = 'treemap',  parents = NA,
               texttemplate = "%{label}: %{value:,s}",
               hovertemplate = "Label: %{label} <br>Count: %{value}<extra></extra>")
  
  save_plot_widget.function(p, file = "ion_o_minus_treemap.html")
  save_plot_widget.function(fig, file = "ion_o_minus_pie.html")
  
  # Query_ion_n_plus
  ion_n_plus <- dbGetQuery(con, get_query_ion.function('N+'))
  ion_n_plus$ion <- gsub('\\s+', '', ion_n_plus$ion)
  
  colors <- c('rgb(211,94,96)', 'rgb(128,133,133)', 'rgb(144,103,167)', 'rgb(171,104,87)', 'rgb(114,147,203)')
  fig <- plot_ly(ion_n_plus, labels = ~ion, values = ~total, type = 'pie',
                 textposition = 'inside',
                 texttemplate = "%{label}: %{value:,s} <br>(%{percent})",
                 insidetextfont = list(color = '#FFFFFF'),
                 hovertemplate = "Label: %{label} <br>Count: %{text} </br>Percentage: %{percent}<extra></extra> ",
                 text = ~paste(total),
                 marker = list(colors = colors,
                               line = list(color = '#FFFFFF', width = 1)),
                 showlegend = FALSE)
  fig <- fig %>% layout(title = '',
                        xaxis = list(showgrid = FALSE, zeroline = FALSE, showticklabels = FALSE),
                        yaxis = list(showgrid = FALSE, zeroline = FALSE, showticklabels = FALSE))
  
  
  p <- plot_ly(ion_n_plus, labels = ~ion, values = ~total, type = 'treemap',  parents = NA,
               texttemplate = "%{label}: %{value:,s}",
               hovertemplate = "Label: %{label} <br>Count: %{value}<extra></extra>")
  
  save_plot_widget.function(p, file = "ion_n_plus_treemap.html")
  save_plot_widget.function(fig, file = "ion_n_plus_pie.html")
  
  # Query_ion_n_minus
  ion_n_minus <- dbGetQuery(con, get_query_ion.function('N-'))
  ion_n_minus$ion <- gsub('\\s+', '', ion_n_minus$ion)
  
  colors <- c('rgb(211,94,96)', 'rgb(128,133,133)', 'rgb(144,103,167)', 'rgb(171,104,87)', 'rgb(114,147,203)')
  fig <- plot_ly(ion_n_minus, labels = ~ion, values = ~total, type = 'pie',
                 textposition = 'inside',
                 texttemplate = "%{label}: %{value:,s} <br>(%{percent})",
                 insidetextfont = list(color = '#FFFFFF'),
                 hovertemplate = "Label: %{label} <br>Count: %{text} </br>Percentage: %{percent}<extra></extra> ",
                 text = ~paste(total),
                 marker = list(colors = colors,
                               line = list(color = '#FFFFFF', width = 1)),
                 showlegend = FALSE)
  fig <- fig %>% layout(title = '',
                        xaxis = list(showgrid = FALSE, zeroline = FALSE, showticklabels = FALSE),
                        yaxis = list(showgrid = FALSE, zeroline = FALSE, showticklabels = FALSE))
  
  
  p <- plot_ly(ion_n_minus, labels = ~ion, values = ~total, type = 'treemap',  parents = NA,
               texttemplate = "%{label}: %{value:,s}",
               hovertemplate = "Label: %{label} <br>Count: %{value}<extra></extra>")
  
  save_plot_widget.function(p, file = "ion_n_minus_treemap.html")
  save_plot_widget.function(fig, file = "ion_n_minus_pie.html")
  
  # Query_ion_z_plus
  ion_z_plus <- dbGetQuery(con, get_query_ion.function('Z+'))
  ion_z_plus$ion <- gsub('\\s+', '', ion_z_plus$ion)
  
  
  colors <- c('rgb(211,94,96)', 'rgb(128,133,133)', 'rgb(144,103,167)', 'rgb(171,104,87)', 'rgb(114,147,203)')
  fig <- plot_ly(ion_z_plus, labels = ~ion, values = ~total, type = 'pie',
                 textposition = 'inside',
                 texttemplate = "%{label}: %{value:,s} <br>(%{percent})",
                 insidetextfont = list(color = '#FFFFFF'),
                 hovertemplate = "Label: %{label} <br>Count: %{text} </br>Percentage: %{percent}<extra></extra> ",
                 text = ~paste(total),
                 marker = list(colors = colors,
                               line = list(color = '#FFFFFF', width = 1)),
                 showlegend = FALSE)
  fig <- fig %>% layout(title = '',
                        xaxis = list(showgrid = FALSE, zeroline = FALSE, showticklabels = FALSE),
                        yaxis = list(showgrid = FALSE, zeroline = FALSE, showticklabels = FALSE))
  
  
  p <- plot_ly(ion_z_plus, labels = ~ion, values = ~total, type = 'treemap',  parents = NA,
               texttemplate = "%{label}: %{value:,s}",
               hovertemplate = "Label: %{label} <br>Count: %{value}<extra></extra>")
  
  save_plot_widget.function(p, file = "ion_ion_z_plus_treemap.html")
  save_plot_widget.function(fig, file = "ion_ion_z_plus_pie.html")
  
  # Query_ion_z_minus
  ion_z_minus <- dbGetQuery(con, get_query_ion.function('Z-'))
  ion_z_minus$ion <- gsub('\\s+', '', ion_z_minus$ion)
  
  colors <- c('rgb(211,94,96)', 'rgb(128,133,133)', 'rgb(144,103,167)', 'rgb(171,104,87)', 'rgb(114,147,203)')
  fig <- plot_ly(ion_z_minus, labels = ~ion, values = ~total, type = 'pie',
                 textposition = 'inside',
                 texttemplate = "%{label}: %{value:,s} <br>(%{percent})",
                 insidetextfont = list(color = '#FFFFFF'),
                 hovertemplate = "Label: %{label} <br>Count: %{text} </br>Percentage: %{percent}<extra></extra> ",
                 text = ~paste(total),
                 marker = list(colors = colors,
                               line = list(color = '#FFFFFF', width = 1)),
                 showlegend = FALSE)
  fig <- fig %>% layout(title = '',
                        xaxis = list(showgrid = FALSE, zeroline = FALSE, showticklabels = FALSE),
                        yaxis = list(showgrid = FALSE, zeroline = FALSE, showticklabels = FALSE))
  
  p <- plot_ly(ion_z_minus, 
               labels = ~ion,
               values = ~total,
               type = 'treemap',
               parents = NA,
               texttemplate = "%{label}: %{value:,s}",
               hovertemplate = "Label: %{label} <br>Count: %{value}<extra></extra>")
  
  save_plot_widget.function(p, file = "ion_ion_z_minus_treemap.html")
  save_plot_widget.function(fig, file = "ion_ion_z_minus_pie.html")
  
  
  
  # loop length
  loop_length <- dbGetQuery(con, Query_loop_length)
  loop_length$loop_length <-  interaction(loop_length$loop_length, "loops", sep = " ")
  loop_length$loop_length <- as.character(loop_length$loop_length)
  loop_length$loop_length[loop_length$loop_length == "1 loops"] <- "1 loop"
  
  
  colors <- c('rgb(211,94,96)', 'rgb(128,133,133)', 'rgb(144,103,167)', 'rgb(171,104,87)', 'rgb(114,147,203)')
  fig <- plot_ly(loop_length, labels = ~loop_length, values = ~count, type = 'pie',
                 textposition = 'inside',
                 texttemplate = "%{label}: %{value:,s} <br>(%{percent})",
                 insidetextfont = list(color = '#FFFFFF'),
                 hovertemplate = "Label: %{label} <br>Count: %{text} </br>Percentage: %{percent}<extra></extra> ",
                 text = ~paste(count),
                 marker = list(colors = colors,
                               line = list(color = '#FFFFFF', width = 1)),
                 showlegend = FALSE)
  fig <- fig %>% layout(title = '',
                        xaxis = list(showgrid = FALSE, zeroline = FALSE, showticklabels = FALSE),
                        yaxis = list(showgrid = FALSE, zeroline = FALSE, showticklabels = FALSE))
  
  
  
  save_plot_widget.function(fig, file = "loop_length.html")
  
  
  
  
